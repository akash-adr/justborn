import { createAdminClient } from '@/lib/supabase/admin'
import { VALID_PROMOS } from './cartService'

export interface ServerCouponResult {
  valid: boolean
  couponId?: string
  code: string
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  discountAmount: number
  maximumDiscountAmount?: number | null
  minimumOrderAmount?: number | null
  description?: string
  error?: string
  errorType?: 'NOT_FOUND' | 'INACTIVE' | 'EXPIRED' | 'MIN_ORDER_UNMET' | 'USAGE_LIMIT_EXCEEDED' | 'INVALID'
  isDatabaseCoupon: boolean
}

export const serverCouponService = {
  /**
   * Authoritative server-side validation of promotional coupons
   * Validates:
   * 1. Coupon existence
   * 2. Active status
   * 3. Expiration date
   * 4. Minimum order subtotal requirement
   * 5. Usage limit threshold
   * 6. Accurate discount calculation (percentage vs fixed)
   * 7. Maximum discount cap
   */
  async validateCoupon(rawCode: string, subtotal: number): Promise<ServerCouponResult> {
    const code = (rawCode || '').trim().toUpperCase()

    if (!code) {
      return {
        valid: false,
        code: '',
        discountAmount: 0,
        error: 'Please enter a coupon code.',
        errorType: 'INVALID',
        isDatabaseCoupon: false,
      }
    }

    const supabase: any = createAdminClient()

    // 1. Query Supabase coupons table
    const { data: dbCoupon, error: dbError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (!dbError && dbCoupon) {
      // 2. Validate Active Status
      if (!dbCoupon.is_active) {
        return {
          valid: false,
          code,
          discountAmount: 0,
          error: `Coupon '${code}' is currently inactive or disabled.`,
          errorType: 'INACTIVE',
          isDatabaseCoupon: true,
        }
      }

      // 3. Validate Expiration
      if (dbCoupon.expires_at) {
        const expiry = new Date(dbCoupon.expires_at)
        if (expiry < new Date()) {
          const formattedDate = expiry.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          return {
            valid: false,
            code,
            discountAmount: 0,
            error: `Coupon '${code}' expired on ${formattedDate}.`,
            errorType: 'EXPIRED',
            isDatabaseCoupon: true,
          }
        }
      }

      // 4. Validate Usage Limit
      if (
        dbCoupon.usage_limit !== null &&
        dbCoupon.usage_limit !== undefined &&
        (dbCoupon.used_count || 0) >= dbCoupon.usage_limit
      ) {
        return {
          valid: false,
          code,
          discountAmount: 0,
          error: `Coupon '${code}' has reached its maximum usage limit.`,
          errorType: 'USAGE_LIMIT_EXCEEDED',
          isDatabaseCoupon: true,
        }
      }

      // 5. Validate Minimum Order Requirement
      const minAmount = Number(dbCoupon.minimum_order_amount) || 0
      if (minAmount > 0 && subtotal < minAmount) {
        return {
          valid: false,
          code,
          discountAmount: 0,
          minimumOrderAmount: minAmount,
          error: `Minimum order subtotal of ₹${minAmount} required for coupon '${code}'. Add ₹${Math.max(
            0,
            minAmount - subtotal
          )} more.`,
          errorType: 'MIN_ORDER_UNMET',
          isDatabaseCoupon: true,
        }
      }

      // 6. Calculate Authoritative Discount
      let calculatedDiscount = 0
      if (dbCoupon.discount_type === 'percentage') {
        calculatedDiscount = Math.round((subtotal * dbCoupon.discount_value) / 100)
      } else {
        calculatedDiscount = Math.min(subtotal, dbCoupon.discount_value)
      }

      // 7. Enforce Maximum Discount Cap
      const maxDiscount = Number(dbCoupon.maximum_discount_amount) || 0
      if (maxDiscount > 0 && calculatedDiscount > maxDiscount) {
        calculatedDiscount = maxDiscount
      }

      return {
        valid: true,
        couponId: dbCoupon.id,
        code: dbCoupon.code,
        discountType: dbCoupon.discount_type,
        discountValue: dbCoupon.discount_value,
        discountAmount: calculatedDiscount,
        maximumDiscountAmount: maxDiscount > 0 ? maxDiscount : null,
        minimumOrderAmount: minAmount > 0 ? minAmount : null,
        description:
          dbCoupon.discount_type === 'percentage'
            ? `${dbCoupon.discount_value}% Savings${maxDiscount > 0 ? ` (up to ₹${maxDiscount})` : ''}`
            : `₹${dbCoupon.discount_value} Instant Off`,
        isDatabaseCoupon: true,
      }
    }

    // Check Fallback Presets
    const preset = VALID_PROMOS[code]
    if (preset) {
      let calculatedDiscount = 0
      if (preset.type === 'percentage') {
        calculatedDiscount = Math.round((subtotal * preset.value) / 100)
      } else {
        calculatedDiscount = Math.min(subtotal, preset.value)
      }

      return {
        valid: true,
        code,
        discountType: preset.type,
        discountValue: preset.value,
        discountAmount: calculatedDiscount,
        description: preset.description,
        isDatabaseCoupon: false,
      }
    }

    // Not found
    return {
      valid: false,
      code,
      discountAmount: 0,
      error: `Coupon '${code}' is invalid or does not exist.`,
      errorType: 'NOT_FOUND',
      isDatabaseCoupon: false,
    }
  },

  /**
   * Atomically increment coupon used_count, protecting against race conditions.
   * Ensures used_count never exceeds usage_limit even with concurrent checkouts.
   */
  async recordCouponUsage(couponId: string): Promise<boolean> {
    if (!couponId) return true

    try {
      const supabase: any = createAdminClient()

      // Guard usage limit race condition with optimistic concurrency loop
      let retries = 3
      while (retries > 0) {
        retries--
        
        const { data: freshCoupon } = await supabase
          .from('coupons')
          .select('id, used_count, usage_limit')
          .eq('id', couponId)
          .single()

        if (!freshCoupon) return false

        const currentCount = freshCoupon.used_count || 0

        if (freshCoupon.usage_limit !== null && freshCoupon.usage_limit !== undefined) {
          if (currentCount >= freshCoupon.usage_limit) {
            console.warn(`Coupon ${couponId} usage limit already reached.`)
            return false
          }
        }

        // Conditional atomic update based on currentCount
        const { data, error } = await supabase
          .from('coupons')
          .update({ used_count: currentCount + 1 })
          .eq('id', couponId)
          .eq('used_count', currentCount)
          .select('id')
          .single()

        if (data && !error) {
          return true // Successfully updated
        }
        // If error (optimistic lock failed), it will loop and try again
      }
      
      console.warn(`Concurrent race condition prevented over-redemption on coupon ${couponId} after retries`)
      return false
    } catch (err) {
      console.error('Error recording coupon usage:', err)
      return false
    }
  },
}
