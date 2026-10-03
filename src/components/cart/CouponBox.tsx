'use client'

import React, { useState } from 'react'
import { validateCouponAction, CouponValidationResult } from '@/app/actions/coupon'
import { formatPrice } from '@/lib/utils'
import {
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export interface AppliedCouponState {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  discountAmount: number
  description: string
}

interface CouponBoxProps {
  subtotal: number
  appliedCoupon: AppliedCouponState | null
  onApply: (coupon: AppliedCouponState) => void
  onRemove: () => void
  className?: string
}

export function CouponBox({
  subtotal,
  appliedCoupon,
  onApply,
  onRemove,
  className = '',
}: CouponBoxProps) {
  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorState, setErrorState] = useState<{
    type: 'INVALID' | 'EXPIRED' | 'MIN_AMOUNT' | 'EXHAUSTED' | 'EMPTY'
    message: string
  } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleApply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = inputCode.trim()

    if (!code) {
      setErrorState({
        type: 'EMPTY',
        message: 'Please enter a promotional or voucher code.',
      })
      return
    }

    try {
      setLoading(true)
      setErrorState(null)
      setSuccessMessage(null)

      const result: CouponValidationResult = await validateCouponAction(code, subtotal)

      if (!result.success || !result.coupon) {
        setErrorState({
          type: result.errorType || 'INVALID',
          message: result.message,
        })
        return
      }

      // Success
      onApply({
        code: result.coupon.code,
        type: result.coupon.type,
        value: result.coupon.value,
        discountAmount: result.coupon.discountAmount,
        description: result.coupon.description,
      })
      setInputCode('')
      setSuccessMessage(result.message)
    } catch (err: any) {
      setErrorState({
        type: 'INVALID',
        message: err.message || 'Unable to validate promotional code.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    onRemove()
    setSuccessMessage(null)
    setErrorState(null)
    setInputCode('')
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[#E63946]" />
          Promo Code or Voucher
        </span>
        {!appliedCoupon && (
          <span className="text-[10px] text-stone-400 font-normal">
            Try: <strong className="text-stone-600 font-mono">JUSTBORN10</strong>
          </span>
        )}
      </label>

      {/* Applied State with Discount Preview */}
      {appliedCoupon ? (
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 transition-all animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs text-emerald-950 uppercase tracking-wider">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                  {appliedCoupon.description}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white/90 px-2.5 py-1 rounded-lg border border-emerald-200/80 shadow-2xs">
                  <span>Discount Preview:</span>
                  <span className="text-emerald-700 font-extrabold">
                    -{formatPrice(appliedCoupon.discountAmount)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-emerald-700 hover:text-rose-600 hover:bg-emerald-100/60 rounded-xl transition cursor-pointer shrink-0"
              title="Remove coupon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Input Container (div to prevent nested form hydration errors when embedded inside Checkout/Cart forms) */
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase())
                  if (errorState) setErrorState(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.stopPropagation()
                    handleApply()
                  }
                }}
                placeholder="ENTER COUPON CODE"
                className="w-full text-xs rounded-2xl bg-stone-50 border border-stone-200/90 px-3.5 py-2.5 text-stone-900 uppercase font-mono placeholder:normal-case placeholder:font-sans placeholder:text-stone-400 focus:outline-none focus:border-[#D9232E] focus:bg-white transition"
              />
              {inputCode && (
                <button
                  type="button"
                  onClick={() => setInputCode('')}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleApply()}
              disabled={loading || !inputCode.trim()}
              className="inline-flex items-center justify-center gap-1.5 bg-[#D9232E] hover:bg-[#BF1620] text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs shrink-0 cursor-pointer"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
            </button>
          </div>

          {/* Feedback Messages */}
          {successMessage && (
            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </p>
          )}

          {errorState && (
            <div
              className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2 animate-in fade-in ${
                errorState.type === 'EXPIRED'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : errorState.type === 'MIN_AMOUNT'
                  ? 'bg-blue-50 text-blue-900 border-blue-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {errorState.type === 'EXPIRED' ? (
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-bold text-[11px] uppercase tracking-wider mb-0.5">
                  {errorState.type === 'EXPIRED'
                    ? 'Coupon Expired'
                    : errorState.type === 'MIN_AMOUNT'
                    ? 'Cart Minimum Required'
                    : 'Invalid Coupon'}
                </p>
                <p className="text-xs leading-relaxed">{errorState.message}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
