'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatusAction, updatePaymentStatusAction } from '../../actions'
import { Check, Loader2, AlertCircle } from 'lucide-react'

const ALLOWED_NEXT_STATUSES: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function StatusUpdater({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: {
  orderId: string
  currentStatus: string
  currentPaymentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus.toLowerCase())
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus.toLowerCase())
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const allowedNext = ALLOWED_NEXT_STATUSES[currentStatus.toLowerCase()] || []

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setLoadingStatus(true)
      setMessage(null)
      const res = await updateOrderStatusAction(orderId, newStatus)
      if (res.success) {
        setStatus(newStatus)
        setMessage({ type: 'success', text: `Order status transitioned to "${newStatus}".` })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: res.error || 'Transition failed.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoadingStatus(false)
    }
  }

  const handleUpdatePayment = async (newPayment: string) => {
    try {
      setLoadingPayment(true)
      setMessage(null)
      const res = await updatePaymentStatusAction(orderId, newPayment)
      if (res.success) {
        setPaymentStatus(newPayment)
        setMessage({ type: 'success', text: `Payment marked as "${newPayment}".` })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: res.error || 'Payment update failed.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoadingPayment(false)
    }
  }

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-6">
      <h3 className="text-base font-black text-stone-900 border-b border-stone-100 pb-3">
        Fulfillment & Payment Control
      </h3>

      {message && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Order Status Transition */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-stone-700">
          Order Status: <span className="font-mono uppercase text-[#E63946]">{status}</span>
        </label>

        {allowedNext.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allowedNext.map((nextStatus) => (
              <button
                key={nextStatus}
                type="button"
                disabled={loadingStatus}
                onClick={() => handleUpdateStatus(nextStatus)}
                className={`text-xs font-bold px-4 py-2 rounded-full border transition disabled:opacity-50 ${
                  nextStatus === 'cancelled'
                    ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                    : 'border-stone-900 bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                {loadingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  `Transition to: ${nextStatus.toUpperCase()}`
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic">
            This order has reached its terminal status ({status}). No further state transitions allowed.
          </p>
        )}
      </div>

      {/* Payment Status Override */}
      <div className="pt-4 border-t border-stone-100 space-y-2">
        <label className="block text-xs font-bold text-stone-700">
          Settlement Status: <span className="font-mono uppercase text-emerald-700">{paymentStatus}</span>
        </label>
        <div className="flex items-center gap-2">
          <select
            value={paymentStatus}
            disabled={loadingPayment}
            onChange={(e) => handleUpdatePayment(e.target.value)}
            className="text-xs font-bold rounded-2xl border border-stone-200 px-3 py-2 bg-white text-stone-800 focus:outline-none focus:border-[#E63946]"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          {loadingPayment && <Loader2 className="w-4 h-4 animate-spin text-stone-400" />}
        </div>
      </div>
    </div>
  )
}
