import React from 'react';
import Link from 'next/link';
import { serverOrderService } from '@/lib/services/server/orderService';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, Clock, Truck, ShoppingBag, ArrowRight, PackageX } from 'lucide-react';

export const metadata = {
  title: 'My Orders | Just Born',
};

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'delivered':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    case 'shipped':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
          <Truck className="w-3.5 h-3.5" /> In Transit
        </span>
      );
    case 'processing':
    case 'pending':
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          <Clock className="w-3.5 h-3.5" /> Processing
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
          <PackageX className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {status}
        </span>
      );
  }
}

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirectTo=/orders');
  }

  const { success, data: orders } = await serverOrderService.getOrders();

  if (!success || !orders || orders.length === 0) {
    return (
      <div className="min-h-screen py-24 bg-white flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-stone-300" />
        </div>
        <h2 className="text-2xl font-serif text-stone-900 mb-2">No Playroom Orders Yet</h2>
        <p className="text-stone-500 max-w-md mb-8">
          When you order keepsake toys from Just Born, your tracking updates and digital receipts will live right here.
        </p>
        <Link href="/shop">
          <button className="bg-[#E63946] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-red-700 transition">
            Explore Collections
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[#faf9f6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Order History</h1>
            <p className="text-sm text-stone-500 mt-1">Review past keepsake purchases and track deliveries.</p>
          </div>
          <Link href="/shop">
            <button className="hidden sm:inline-block border border-stone-200 bg-white text-stone-700 px-5 py-2 rounded-full text-xs font-bold hover:bg-stone-50 transition">
              Shop More
            </button>
          </Link>
        </div>

        <div className="space-y-6">
          {orders.map((order: any) => {
            const itemCount = order.order_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
            const firstItem = order.order_items?.[0];

            return (
              <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-stone-900">Order #{order.order_number}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-stone-400">Total Amount</p>
                    <p className="text-xl font-black text-stone-900">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>

                <div className="py-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-6 h-6 text-stone-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {firstItem?.product_name} {itemCount > 1 ? `and ${itemCount - 1} more` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
                  <Link href={`/orders/${order.id}`}>
                    <button className="flex items-center gap-2 text-sm font-bold text-[#E63946] hover:text-red-700 transition">
                      View Order Details <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
