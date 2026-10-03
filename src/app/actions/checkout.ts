'use server';

import { checkoutService } from '@/lib/services/server/checkoutService';
import { revalidatePath } from 'next/cache';

export async function processCheckoutAction(
  addressId: string,
  promoCode?: string,
  notes?: string
) {
  const result = await checkoutService.processCheckout(addressId, promoCode, notes);
  
  if (result.success) {
    // Clear cart cache
    revalidatePath('/cart');
    revalidatePath('/checkout');
  }
  
  return result;
}

export async function verifyPaymentAction(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  const result = await checkoutService.verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  
  if (result.success) {
    revalidatePath('/cart');
    revalidatePath('/checkout');
    revalidatePath('/orders');
  }
  
  return result;
}

export async function markPaymentFailedAction(razorpayOrderId: string) {
  const result = await checkoutService.markPaymentFailed(razorpayOrderId);
  
  if (result.success) {
    revalidatePath('/orders');
  }
  
  return result;
}
