import React from 'react';
import Link from 'next/link';
import { serverOrderService } from '@/lib/services/server/orderService';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, ArrowLeft, MapPin, CreditCard, Package } from 'lucide-react';

export const metadata = {
  title: 'Order Details | Just Born',
};

// Define status map
const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  'pending': 'Order Placed',
  'confirmed': 'Confirmed',
  'processing': 'Processing',
  'shipped': 'Shipped',
  'delivered': 'Delivered'
};

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { success, data: order } = await serverOrderService.getOrderById(params.id);

  if (!success || !order) {
    return (
      <div className="min-h-screen py-24 bg-[#faf9f6] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-serif text-stone-900 mb-2">Order Not Found</h2>
        <p className="text-stone-500 mb-6">The order you are looking for does not exist or you do not have access.</p>
        <Link href="/orders">
          <button className="bg-[#E63946] text-white px-8 py-3 rounded-full font-bold text-sm">
            Back to Orders
          </button>
        </Link>
      </div>
    );
  }

  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
  const isCancelled = order.status === 'cancelled';
  
  // Calculate current step index
  let currentStep = STATUS_STEPS.indexOf(order.status);
  if (currentStep === -1) currentStep = 0; // Default if unknown

  return (
    <div className="min-h-screen py-10 bg-[#faf9f6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Order #{order.order_number}</h1>
          <p className="text-sm text-stone-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-6">Order Status</h3>
          
          {isCancelled ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="font-bold text-lg">!</span>
              </div>
              <div>
                <p className="font-bold">Order Cancelled</p>
                <p className="text-sm text-red-600/80">This order was cancelled and will not be fulfilled.</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 rounded-full hidden sm:block"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full hidden sm:block transition-all duration-500"
                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              ></div>

              <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={step} className="flex sm:flex-col items-center gap-4 sm:gap-3 group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0
                        ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-stone-200 text-stone-300'}
                        ${isCurrent ? 'ring-4 ring-emerald-50' : ''}
                      `}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="sm:text-center">
                        <p className={`text-sm font-bold ${isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>
                          {STATUS_LABELS[step]}
                        </p>
                        {isCurrent && <p className="text-[11px] text-emerald-600 font-medium">Currently here</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Package className="w-4 h-4 text-stone-400" /> Items Ordered
              </h3>
              
              <div className="divide-y divide-stone-100">
                {order.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 leading-snug">{item.product_name}</h4>
                      <p className="text-xs text-stone-500 mt-1">
                        Qty: {item.quantity} × {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <span className="text-sm font-black text-stone-900">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary & Details */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-stone-400" /> Payment Details
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="font-medium text-stone-900">{order.shipping_amount === 0 ? 'Free' : formatPrice(order.shipping_amount)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Tax</span>
                  <span className="font-medium text-stone-900">{formatPrice(order.tax_amount)}</span>
                </div>
                <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                  <span className="font-bold text-stone-900">Total</span>
                  <span className="text-xl font-black text-stone-900">{formatPrice(order.total_amount)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-stone-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-500 font-medium">Payment Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider
                    ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-400" /> Delivery Address
              </h3>
              
              <div className="text-sm text-stone-600 space-y-1">
                <p className="font-bold text-stone-900">{addr?.fullName || user.user_metadata?.full_name}</p>
                <p>{addr?.addressLine1}</p>
                {addr?.addressLine2 && <p>{addr?.addressLine2}</p>}
                <p>{addr?.city}, {addr?.state} {addr?.postalCode}</p>
                <p className="pt-2 text-stone-500">Phone: {addr?.phone}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
