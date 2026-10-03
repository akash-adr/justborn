'use server'

import { serverCouponService, ServerCouponResult } from '@/lib/services/server/couponService'

export interface CouponValidationResult {
  success: boolean
  errorType?: 'INVALID' | 'EXPIRED' | 'MIN_AMOUNT' | 'EXHAUSTED' | 'EMPTY'
  message: string
  coupon?: {
    code: string
    type: 'percentage' | 'fixed'
    value: number
    discountAmount: number
    description: string
    expiresAt?: string | null
    minimumOrderAmount?: number
  }
}

/**
 * Validate a promotional coupon code against Supabase database and presets
 */
export async function validateCouponAction(
  rawCode: string,
  subtotal: number = 0
): Promise<CouponValidationResult> {
  const result: ServerCouponResult = await serverCouponService.validateCoupon(rawCode, subtotal)

  if (!result.valid) {
    let errorType: 'INVALID' | 'EXPIRED' | 'MIN_AMOUNT' | 'EXHAUSTED' | 'EMPTY' = 'INVALID'
    if (result.errorType === 'EXPIRED') errorType = 'EXPIRED'
    else if (result.errorType === 'MIN_ORDER_UNMET') errorType = 'MIN_AMOUNT'
    else if (result.errorType === 'USAGE_LIMIT_EXCEEDED') errorType = 'EXHAUSTED'
    else if (!rawCode.trim()) errorType = 'EMPTY'

    return {
      success: false,
      errorType,
      message: result.error || 'Invalid coupon code.',
    }
  }

  return {
    success: true,
    message: `Coupon '${result.code}' applied! You save ₹${result.discountAmount}. 🎉`,
    coupon: {
      code: result.code,
      type: result.discountType || 'fixed',
      value: result.discountValue || 0,
      discountAmount: result.discountAmount,
      description: result.description || 'Promotional Discount',
      minimumOrderAmount: result.minimumOrderAmount || undefined,
    },
  }
}
