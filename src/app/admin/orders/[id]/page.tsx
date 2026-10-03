import { requireAdmin } from '@/lib/auth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Package, CreditCard, User } from 'lucide-react'
import { StatusUpdater } from './StatusUpdater'

export const metadata = {
  title: 'Order Details | Just Born Admin',
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const supabase: any = createAdminClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Also fetch user profile if available
  let profile = null
  if (order.user_id) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .single()
    profile = prof
  }

  // Also fetch payments row
  const { data: payment } = await supabase
    .from('payments')
    .select('id, status, payment_method, razorpay_order_id, amount, created_at')
    .eq('order_id', order.id)
    .single()

  const addr =
    typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address)
      : order.shipping_address

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-white border border-stone-200/80 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">
              Order #{order.order_number}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Placed on{' '}
              {new Date(order.created_at).toLocaleDateString('en-IN', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Ordered Toys & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered Products Table */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Package className="w-4 h-4 text-stone-400" /> Ordered Items (
              {order.order_items?.length || 0})
            </h2>

            <div className="divide-y divide-stone-100">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-stone-900">{item.product_name}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Quantity: <strong className="text-stone-800">{item.quantity}</strong> ×{' '}
                      {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-xs font-black text-stone-900 font-mono">
                    {formatPrice(item.total_price || item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}

              {(!order.order_items || order.order_items.length === 0) && (
                <p className="text-xs text-stone-400 py-4 text-center">No order items recorded.</p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">{formatPrice(order.subtotal || 0)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Savings</span>
                  <span className="font-bold">-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-stone-900">
                  {order.shipping_amount === 0 ? 'Free' : formatPrice(order.shipping_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-bold text-stone-900">{formatPrice(order.tax_amount || 0)}</span>
              </div>
              <div className="pt-3 border-t border-stone-100 flex justify-between text-sm font-black text-stone-900">
                <span>Total Payable</span>
                <span className="text-[#E63946] text-base">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <MapPin className="w-4 h-4 text-stone-400" /> Delivery & Destination
            </h2>

            <div className="text-xs text-stone-700 space-y-1.5">
              <p className="font-bold text-sm text-stone-900">
                {addr?.fullName || profile?.full_name || 'Customer'}
              </p>
              <p>{addr?.addressLine1 || addr?.street || 'N/A'}</p>
              {addr?.addressLine2 && <p>{addr.addressLine2}</p>}
              <p>
                {addr?.city}, {addr?.state} {addr?.postalCode || addr?.zipCode}
              </p>
              <p className="font-mono text-stone-500 pt-1">
                Contact Phone: {addr?.phone || profile?.phone || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Controls & Payment Info */}
        <div className="space-y-6">
          <StatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.payment_status}
          />

          {/* Payment Inspection Card */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-3 text-xs">
            <h3 className="font-black text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
              <CreditCard className="w-4 h-4 text-stone-400" /> Payment Telemetry
            </h3>

            <div className="space-y-2 text-stone-600">
              <div className="flex justify-between">
                <span>Payment State</span>
                <span className="font-mono uppercase font-bold text-emerald-700">
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-bold text-stone-800">
                  {payment?.payment_method || 'Razorpay Gateway'}
                </span>
              </div>
              {payment?.razorpay_order_id && (
                <div className="pt-2 border-t border-stone-100">
                  <span className="block text-[10px] text-stone-400 font-bold uppercase">
                    Razorpay Order ID
                  </span>
                  <span className="font-mono text-[11px] text-stone-800 break-all">
                    {payment.razorpay_order_id}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Profile Card */}
          {profile && (
            <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-3 text-xs">
              <h3 className="font-black text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                <User className="w-4 h-4 text-stone-400" /> Registered Profile
              </h3>
              <p className="font-bold text-stone-900">{profile.full_name || 'Anonymous'}</p>
              <p className="text-stone-500">Role: <span className="font-mono uppercase font-bold text-stone-800">{profile.role || 'customer'}</span></p>
              <p className="text-stone-400 text-[11px]">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
