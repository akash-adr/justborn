import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import OrderSuccessClient from './OrderSuccessClient';

export default async function OrderSuccessPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const supabase: any = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !order) {
    redirect('/orders');
  }

  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;

  return (
    <div className="min-h-screen py-16 bg-[#faf9f6]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <OrderSuccessClient />
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Payment & Order Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mt-3 mb-2">
              Thank You for Choosing Just Born!
            </h1>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              We have received your nursery order. Our artisans are wrapping your heirloom toys in non-toxic tissue and recycled boxes.
            </p>
          </div>

          <div className="bg-stone-50 rounded-2xl p-5 text-left border border-stone-200/60 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200/70">
              <span className="text-stone-500 font-medium">Order Number</span>
              <span className="font-mono font-bold text-stone-900 text-sm">{order.order_number}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">Recipient</span>
              <span className="font-semibold text-stone-800">{addr?.fullName || user.user_metadata?.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500 font-medium">Shipping Address</span>
              <span className="font-semibold text-stone-800 text-right max-w-xs truncate">
                {addr?.addressLine1}, {addr?.city}, {addr?.state} - {addr?.postalCode}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-200/70">
              <span className="font-bold text-stone-800">Total Paid</span>
              <span className="font-black text-stone-900 text-base">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/orders" className="flex-1">
              <button className="w-full bg-[#E63946] text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition">
                View Order Status
              </button>
            </Link>
            <Link href="/shop" className="flex-1">
              <button className="w-full bg-white text-stone-700 border border-stone-200 py-3 rounded-xl font-bold text-sm hover:bg-stone-50 transition">
                Continue Shopping
              </button>
            </Link>
          </div>

          <p className="text-[11px] text-stone-400">
            A detailed confirmation receipt has been dispatched to{' '}
            <strong className="text-stone-600">{user.email}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
