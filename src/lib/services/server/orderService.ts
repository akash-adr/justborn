import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';

export const serverOrderService = {
  async getOrders(): Promise<{success: boolean, data?: any[], error?: string}> {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const supabase: any = await createClient();

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: orders || [] };
  },

  async getOrderById(id: string): Promise<{success: boolean, data?: any, error?: string}> {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const supabase: any = await createClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !order) {
      return { success: false, error: error?.message || 'Order not found' };
    }

    return { success: true, data: order };
  },

  async getPaymentStatus(orderId: string): Promise<{success: boolean, data?: {status: string, method: string}, error?: string}> {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'UNAUTHORIZED' };

    const supabase: any = await createClient();
    
    // Ensure the order belongs to the user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();
      
    if (orderError || !order) return { success: false, error: 'ORDER_NOT_FOUND' };

    const { data: payment, error } = await supabase
      .from('payments')
      .select('status, payment_method')
      .eq('order_id', orderId)
      .single();

    if (error || !payment) {
      return { success: false, error: error?.message || 'Payment not found' };
    }

    return { success: true, data: { status: payment.status, method: payment.payment_method || 'unknown' } };
  }
};
