'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  PackageX,
  ArrowRight,
  Eye,
} from 'lucide-react'

interface OrdersTableProps {
  orders: any[]
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
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
          Paid
        </span>
      )
    case 'pending':
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
          Pending
        </span>
      )
    case 'failed':
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60">
          Failed
        </span>
      )
    default:
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
          {status || 'N/A'}
        </span>
      )
  }
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [paymentFilter, setPaymentFilter] = useState('ALL')

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address
      const custName = addr?.fullName || ''
      const custCity = addr?.city || ''

      const matchSearch =
        o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        custName.toLowerCase().includes(search.toLowerCase()) ||
        custCity.toLowerCase().includes(search.toLowerCase())

      const matchStatus = statusFilter === 'ALL' || o.status?.toLowerCase() === statusFilter.toLowerCase()
      const matchPayment = paymentFilter === 'ALL' || o.payment_status?.toLowerCase() === paymentFilter.toLowerCase()

      return matchSearch && matchStatus && matchPayment
    })
  }, [orders, search, statusFilter, paymentFilter])

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search order #, customer, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-stone-200 focus:outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-stone-200 px-3 py-1.5 bg-white text-stone-700 font-medium"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-2xl border border-stone-200 px-3 py-1.5 bg-white text-stone-700 font-medium"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-400 uppercase text-[10px] font-bold">
                <th className="p-4">Order #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer & Location</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((order) => {
                const addr =
                  typeof order.shipping_address === 'string'
                    ? JSON.parse(order.shipping_address)
                    : order.shipping_address
                const itemsCount =
                  order.order_items?.reduce((acc: number, i: any) => acc + (i.quantity || 1), 0) ||
                  order.order_items?.length ||
                  1

                return (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition">
                    <td className="p-4 font-mono font-black text-stone-900">
                      #{order.order_number}
                    </td>

                    <td className="p-4 text-stone-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-stone-900">{addr?.fullName || 'Guest'}</p>
                      <p className="text-[11px] text-stone-400">
                        {addr?.city ? `${addr.city}, ${addr.state || ''}` : 'No address record'}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-full text-[11px]">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </span>
                    </td>

                    <td className="p-4 font-black text-stone-900">
                      {formatPrice(order.total_amount)}
                    </td>

                    <td className="p-4">{getPaymentBadge(order.payment_status)}</td>

                    <td className="p-4">{getStatusBadge(order.status)}</td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-stone-400">
                    No orders matched your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
