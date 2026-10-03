import { requireAdmin } from '@/lib/auth/server'
import { adminAnalyticsService, adminInventoryService } from '@/lib/services/server/adminService'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Store,
  CheckCircle2,
  AlertCircle,
  Truck,
  PackageX,
} from 'lucide-react'

export const metadata = {
  title: 'Admin Dashboard | Just Born Workshop',
}

function getStatusBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Delivered
        </span>
      )
    case 'shipped':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
          <Truck className="w-3 h-3" /> Shipped
        </span>
      )
    case 'confirmed':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          Confirmed
        </span>
      )
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          <Clock className="w-3 h-3" /> Processing
        </span>
      )
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
          Pending
        </span>
      )
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
          <PackageX className="w-3 h-3" /> Cancelled
        </span>
      )
    default:
      return (
        <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full capitalize">
          {status}
        </span>
      )
  }
}

function getPaymentBadge(status: string) {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'captured':
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          Paid
        </span>
      )
    case 'pending':
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
          Pending
        </span>
      )
    case 'failed':
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
          Failed
        </span>
      )
    default:
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
          {status || 'Unknown'}
        </span>
      )
  }
}

export default async function AdminDashboardPage() {
  await requireAdmin()

  const [statsRes, recentOrdersRes, lowStockRes] = await Promise.all([
    adminAnalyticsService.getDashboardStats(),
    adminAnalyticsService.getRecentOrders(8),
    adminInventoryService.getLowStock(10),
  ])

  const stats = statsRes.data || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    averageOrderValue: 0,
  }

  const recentOrders = recentOrdersRes.data || []
  const lowStockProducts = lowStockRes.data || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Workshop Overview</h1>
          <p className="text-sm text-stone-500 mt-1">
            Real-time metrics, active orders, and catalog status for Just Born.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#E63946] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-sm hover:bg-[#D62828] transition"
          >
            + Add New Toy
          </Link>
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-2 bg-white text-stone-700 border border-stone-200/90 text-xs font-bold px-4 py-2.5 rounded-full hover:bg-stone-50 transition"
          >
            <Store className="w-3.5 h-3.5" /> Customer Store
          </Link>
        </div>
      </div>

      {/* Action / Warning Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.pendingOrders > 0 ? (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold">{stats.pendingOrders} Orders Awaiting Processing</p>
                <p className="text-[11px] text-amber-700/90">Fulfill pending shipments promptly to maintain heirloom trust.</p>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-900 underline hover:no-underline shrink-0"
            >
              Review Orders →
            </Link>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3 text-emerald-900">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold">All Orders Cleared</p>
              <p className="text-[11px] text-emerald-700/90">No pending orders awaiting fulfillment at this moment.</p>
            </div>
          </div>
        )}

        {stats.lowStockCount > 0 ? (
          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold">{stats.lowStockCount} Products Low in Stock</p>
                <p className="text-[11px] text-rose-700/90">Available stock is below 10 units for these toys.</p>
              </div>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-rose-900 underline hover:no-underline shrink-0"
            >
              Restock →
            </Link>
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 flex items-center gap-3 text-stone-700">
            <div className="w-9 h-9 rounded-xl bg-stone-200/60 flex items-center justify-center shrink-0 text-stone-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold">Healthy Inventory</p>
              <p className="text-[11px] text-stone-500">All active toy designs have ample stock quantity.</p>
            </div>
          </div>
        )}
      </div>

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{formatPrice(stats.totalRevenue)}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Settled Payments
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{stats.totalOrders}</h3>
            <p className="text-[11px] text-stone-500 mt-1">
              Avg Basket: <strong className="text-stone-700">{formatPrice(stats.averageOrderValue)}</strong>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Customer Accounts</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{stats.totalCustomers}</h3>
            <p className="text-[11px] text-stone-500 mt-1">Verified Parent Profiles</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Catalog</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{stats.totalProducts} Designs</h3>
            <p className="text-[11px] text-stone-500 mt-1">Montessori & Heirloom</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E63946] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Orders + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-stone-900">Recent Customer Orders</h2>
              <p className="text-xs text-stone-500 mt-0.5">Authoritative live order queue from Supabase</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#E63946] hover:text-red-700 flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              No orders placed yet in the workshop.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {recentOrders.map((order: any) => {
                    const addr =
                      typeof order.shipping_address === 'string'
                        ? JSON.parse(order.shipping_address)
                        : order.shipping_address
                    const itemsCount =
                      order.order_items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 1

                    return (
                      <tr key={order.id} className="hover:bg-stone-50/50 transition">
                        <td className="py-3.5 font-mono font-bold text-stone-900">
                          #{order.order_number}
                        </td>
                        <td className="py-3.5 font-medium text-stone-800">
                          {addr?.fullName || 'Guest Customer'}
                        </td>
                        <td className="py-3.5 text-stone-500">
                          {itemsCount} {itemsCount === 1 ? 'toy' : 'toys'}
                        </td>
                        <td className="py-3.5 font-bold text-stone-900">
                          {formatPrice(order.total_amount)}
                        </td>
                        <td className="py-3.5">{getPaymentBadge(order.payment_status)}</td>
                        <td className="py-3.5">{getStatusBadge(order.status)}</td>
                        <td className="py-3.5 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-xs font-bold text-[#E63946] hover:underline"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-stone-900">Stock Alerts</h2>
              <p className="text-xs text-stone-500 mt-0.5">Under 10 units threshold</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-stone-500 hover:text-stone-900"
            >
              Inventory
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All products are well stocked!
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 6).map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/70"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-stone-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-stone-400 font-mono">SKU: {product.sku || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        product.stock_quantity === 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {product.stock_quantity} left
                    </span>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-xs font-bold text-[#E63946] hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-stone-100">
            <Link
              href="/admin/analytics"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-stone-100 text-stone-800 text-xs font-bold hover:bg-stone-200/80 transition"
            >
              Detailed Sales & Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Module */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
        <h2 className="text-base font-black text-stone-900 mb-4">Workshop Control Center</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/orders"
            className="p-4 rounded-2xl bg-stone-50 hover:bg-red-50/50 hover:border-red-200 border border-stone-200/80 transition text-center group"
          >
            <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-stone-600 group-hover:text-[#E63946] transition" />
            <p className="text-xs font-extrabold text-stone-800 group-hover:text-[#E63946]">Orders</p>
            <p className="text-[10px] text-stone-400">Track & Fulfill</p>
          </Link>
          <Link
            href="/admin/products"
            className="p-4 rounded-2xl bg-stone-50 hover:bg-red-50/50 hover:border-red-200 border border-stone-200/80 transition text-center group"
          >
            <Package className="w-6 h-6 mx-auto mb-2 text-stone-600 group-hover:text-[#E63946] transition" />
            <p className="text-xs font-extrabold text-stone-800 group-hover:text-[#E63946]">Products</p>
            <p className="text-[10px] text-stone-400">Inventory & Prices</p>
          </Link>
          <Link
            href="/admin/categories"
            className="p-4 rounded-2xl bg-stone-50 hover:bg-red-50/50 hover:border-red-200 border border-stone-200/80 transition text-center group"
          >
            <Store className="w-6 h-6 mx-auto mb-2 text-stone-600 group-hover:text-[#E63946] transition" />
            <p className="text-xs font-extrabold text-stone-800 group-hover:text-[#E63946]">Categories</p>
            <p className="text-[10px] text-stone-400">Taxonomy & Slugs</p>
          </Link>
          <Link
            href="/admin/customers"
            className="p-4 rounded-2xl bg-stone-50 hover:bg-red-50/50 hover:border-red-200 border border-stone-200/80 transition text-center group"
          >
            <Users className="w-6 h-6 mx-auto mb-2 text-stone-600 group-hover:text-[#E63946] transition" />
            <p className="text-xs font-extrabold text-stone-800 group-hover:text-[#E63946]">Customers</p>
            <p className="text-[10px] text-stone-400">Profiles & Role</p>
          </Link>
          <Link
            href="/admin/coupons"
            className="p-4 rounded-2xl bg-stone-50 hover:bg-red-50/50 hover:border-red-200 border border-stone-200/80 transition text-center group"
          >
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-stone-600 group-hover:text-[#E63946] transition" />
            <p className="text-xs font-extrabold text-stone-800 group-hover:text-[#E63946]">Coupons</p>
            <p className="text-[10px] text-stone-400">Promos & Codes</p>
          </Link>
          <Link
            href="/admin/analytics"
            className="p-4 rounded-2xl bg-stone-50 hover:bg-red-50/50 hover:border-red-200 border border-stone-200/80 transition text-center group"
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-stone-600 group-hover:text-[#E63946] transition" />
            <p className="text-xs font-extrabold text-stone-800 group-hover:text-[#E63946]">Analytics</p>
            <p className="text-[10px] text-stone-400">Sales & Charts</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
