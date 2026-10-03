import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth/server';
import { serverCartService, VALID_PROMOS, ServiceResult } from './cartService';
import { serverCouponService } from './couponService';
import { serverAddressService } from './addressService';
import { razorpay } from '@/lib/razorpay/server';
import { CartCalculationResult } from '@/lib/types';
import crypto from 'crypto';

export const checkoutService = {
  /**
   * Process checkout
   */
  async processCheckout(
    addressId: string,
    promoCode?: string,
    notes?: string
  ): Promise<ServiceResult<{ orderId: string; orderNumber: string; rzpOrderId: string; amount: number; currency: string }>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return { success: false, error: 'UNAUTHORIZED', message: 'You must be signed in to checkout.' };
      }

      const supabase: any = createAdminClient();

      const { data: addresses } = await serverAddressService.getUserAddresses();
      const addressRes = addresses?.find((a: any) => a.id === addressId);
      if (!addressRes) {
        return { success: false, error: 'INVALID_ADDRESS', message: 'The selected address is invalid or not found.' };
      }
      
      const cartResult = await serverCartService.getUserCart();
      if (!cartResult.success || !cartResult.data || cartResult.data.items.length === 0) {
        return { success: false, error: 'EMPTY_CART', message: 'Your cart is empty or no longer available.' };
      }
      
      const { subtotal, shippingFee } = cartResult.data;
      let discountAmount = 0;
      let validatedCoupon: any = null;
      
      if (promoCode) {
        const couponRes = await serverCouponService.validateCoupon(promoCode, subtotal);
        if (!couponRes.valid) {
          return {
            success: false,
            error: 'INVALID_COUPON',
            message: couponRes.error || 'The supplied promotional code is invalid or has expired.',
          };
        }
        discountAmount = couponRes.discountAmount;
        validatedCoupon = couponRes;
      }
      
      const taxAmount = 0;
      const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);
      
      if (totalAmount <= 0) {
        return { success: false, error: 'INVALID_TOTAL', message: 'Invalid order amount.' };
      }

      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `rcpt_${user.id.substring(0, 8)}_${Date.now()}`,
      });
      
      if (!rzpOrder || !rzpOrder.id) {
        throw new Error('Failed to create Razorpay order');
      }

      const orderNumber = `JB${Math.floor(Date.now() / 1000).toString().substring(2)}`;
      
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'pending',
          subtotal,
          discount_amount: discountAmount,
          shipping_amount: shippingFee,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          shipping_address: addressRes as any,
          notes: JSON.stringify({
            userNotes: notes || null,
            couponCode: validatedCoupon?.code || null,
            couponId: validatedCoupon?.couponId || null,
            discountAmount: discountAmount,
          }),
        })
        .select('id, order_number')
        .single();
        
      if (orderError || !newOrder) {
        console.error('Supabase order creation error:', orderError);
        return { success: false, error: 'ORDER_CREATION_FAILED', message: 'Failed to create order.' };
      }

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: newOrder.id,
          razorpay_order_id: rzpOrder.id,
          amount: totalAmount,
          currency: 'INR',
          status: 'created',
          payment_method: 'razorpay'
        });

      if (paymentError) {
        console.error('Supabase payment creation error:', paymentError);
        await supabase.from('orders').delete().eq('id', newOrder.id);
        return { success: false, error: 'PAYMENT_CREATION_FAILED', message: 'Failed to initialize payment tracking.' };
      }

      // Insert order items
      const items = cartResult.data.items;
      const orderItemsToInsert = items.map((item: any) => ({
        order_id: newOrder.id,
        product_id: item.product.id,
        product_name: item.variant ? `${item.product.name} - ${item.variant.name}` : item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
      
      if (itemsError) {
        console.error('Failed to create order items:', itemsError);
        await supabase.from('orders').delete().eq('id', newOrder.id);
        return { success: false, error: 'ORDER_ITEMS_FAILED', message: 'Failed to create order items.' };
      }

      return {
        success: true,
        data: {
          orderId: newOrder.id, orderNumber: newOrder.order_number,
          rzpOrderId: rzpOrder.id,
          amount: totalAmount,
          currency: 'INR'
        },
        message: 'Order created successfully. Proceeding to payment.'
      };

    } catch (err: any) {
      console.error('Checkout error:', err);
      return { success: false, error: 'SERVER_ERROR', message: err.message || 'An unexpected error occurred during checkout.' };
    }
  },

  /**
   * Verify Razorpay Payment Signature and finalize order
   */
  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<ServiceResult<{ orderId: string }>> {
    try {
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string);
      hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return { success: false, error: 'INVALID_SIGNATURE', message: 'Payment signature verification failed.' };
      }

      const supabase: any = createAdminClient();

      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('id, status, order_id, amount')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();

      if (!paymentRecord) {
        return { success: false, error: 'PAYMENT_NOT_FOUND', message: 'Payment record not found.' };
      }

      if (paymentRecord.status === 'captured') {
        return { success: true, data: { orderId: paymentRecord.order_id }, message: 'Payment already processed.' };
      }

      const rzpPayment = await razorpay.payments.fetch(razorpayPaymentId);
      if (!rzpPayment || rzpPayment.amount !== Math.round(paymentRecord.amount * 100)) {
        return { success: false, error: 'AMOUNT_MISMATCH', message: 'Payment amount mismatch detected. Security alert triggered.' };
      }

      const { data: updatedPayment, error: paymentUpdateError } = await supabase
        .from('payments')
        .update({
          status: 'captured',
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature
        })
        .eq('id', paymentRecord.id)
        .eq('status', 'created')
        .select('id')
        .single();

      if (paymentUpdateError || !updatedPayment) {
        return { success: true, data: { orderId: paymentRecord.order_id }, message: 'Payment already processed by another hook.' };
      }

      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid'
        })
        .eq('id', paymentRecord.order_id);

      if (orderUpdateError) throw new Error('Failed to update order status');

      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, product_name')
        .eq('order_id', paymentRecord.order_id);

      if (orderItems && orderItems.length > 0) {
        for (const item of orderItems) {
          // Retry loop for optimistic concurrency control (max 3 retries)
          let retries = 3;
          while (retries > 0) {
            retries--;
            const { data: pData } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
            
            if (pData) {
              const newStock = Math.max(0, pData.stock_quantity - item.quantity);
              
              // Only update if the stock hasn't changed since we read it
              const { data: updatedProd } = await supabase
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', item.product_id)
                .eq('stock_quantity', pData.stock_quantity)
                .select('id')
                .single();
                
              if (updatedProd) {
                break; // Successfully updated, break out of retry loop
              }
            } else {
              break; // Product not found, break out
            }
          }
        }
      }

      await serverCartService.clearCart();

      // Atomically record coupon redemption to protect against race conditions
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select('notes')
          .eq('id', paymentRecord.order_id)
          .single();

        if (orderData?.notes) {
          const parsed = typeof orderData.notes === 'string' ? JSON.parse(orderData.notes) : orderData.notes;
          if (parsed?.couponId) {
            await serverCouponService.recordCouponUsage(parsed.couponId);
          }
        }
      } catch (couponErr) {
        console.warn('Coupon usage record notice:', couponErr);
      }

      return {
        success: true,
        data: { orderId: paymentRecord.order_id },
        message: 'Payment verified and order confirmed successfully.'
      };

    } catch (err: any) {
      console.error('Payment verification error:', err);
      return { success: false, error: 'SERVER_ERROR', message: err.message || 'Payment verification failed.' };
    }
  },

  /**
   * Mark payment as failed
   */
  async markPaymentFailed(razorpayOrderId: string): Promise<ServiceResult<void>> {
    try {
      const supabase: any = createAdminClient();

      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('id, status, order_id')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();

      if (!paymentRecord || paymentRecord.status !== 'created') {
        return { success: true }; 
      }

      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', paymentRecord.id);

      await supabase
        .from('orders')
        .update({ payment_status: 'failed', status: 'cancelled' })
        .eq('id', paymentRecord.order_id);

      return { success: true, message: 'Payment marked as failed.' };
    } catch (err: any) {
      console.error('Mark payment failed error:', err);
      return { success: false, error: 'SERVER_ERROR', message: 'Failed to update payment status.' };
    }
  }
};
