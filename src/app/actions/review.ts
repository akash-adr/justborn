'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/server'
import { revalidatePath } from 'next/cache'

export interface ReviewEligibilityResult {
  authenticated: boolean
  eligible: boolean
  isVerifiedBuyer: boolean
  hasReviewed: boolean
  reason?: string
  existingReview?: {
    id: string
    rating: number
    title: string | null
    comment: string | null
    createdAt: string
  } | null
}

/**
 * Check if the currently authenticated customer has purchased this product
 * and whether they have already submitted a review.
 */
export async function checkReviewEligibility(productId: string): Promise<ReviewEligibilityResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        authenticated: false,
        eligible: false,
        isVerifiedBuyer: false,
        hasReviewed: false,
        reason: 'Please sign in with your Just Born account to submit a verified review.',
      }
    }

    const adminSupabase: any = createAdminClient()

    // 1. Check if user already submitted a review (to prevent duplicate reviews)
    const { data: existing } = await adminSupabase
      .from('reviews')
      .select('id, rating, title, comment, created_at')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .maybeSingle()

    // 2. Authoritatively verify completed/paid purchase history
    const { data: userOrders } = await adminSupabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('user_id', user.id)
      .in('payment_status', ['paid'])

    if (!userOrders || userOrders.length === 0) {
      return {
        authenticated: true,
        eligible: false,
        isVerifiedBuyer: false,
        hasReviewed: !!existing,
        existingReview: existing
          ? {
              id: existing.id,
              rating: existing.rating,
              title: existing.title,
              comment: existing.comment,
              createdAt: existing.created_at,
            }
          : null,
        reason: 'Only customers who have ordered and received this toy can submit a verified purchase review.',
      }
    }

    const orderIds = userOrders.map((o: any) => o.id)

    // Check order_items for this specific product
    const { count } = await adminSupabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .in('order_id', orderIds)
      .eq('product_id', productId)

    const hasPurchased = (count || 0) > 0

    if (!hasPurchased) {
      return {
        authenticated: true,
        eligible: false,
        isVerifiedBuyer: false,
        hasReviewed: !!existing,
        existingReview: existing
          ? {
              id: existing.id,
              rating: existing.rating,
              title: existing.title,
              comment: existing.comment,
              createdAt: existing.created_at,
            }
          : null,
        reason: 'You can only review toys you have purchased. Order this keepsake to unlock verified reviews.',
      }
    }

    return {
      authenticated: true,
      eligible: true,
      isVerifiedBuyer: true,
      hasReviewed: !!existing,
      existingReview: existing
        ? {
            id: existing.id,
            rating: existing.rating,
            title: existing.title,
            comment: existing.comment,
            createdAt: existing.created_at,
          }
        : null,
    }
  } catch (err: any) {
    console.error('Error checking review eligibility:', err)
    return {
      authenticated: false,
      eligible: false,
      isVerifiedBuyer: false,
      hasReviewed: false,
      reason: 'Failed to verify customer purchase eligibility.',
    }
  }
}

/**
 * Submit a customer review with strict verification of:
 * 1. Authenticated user
 * 2. Verified purchase history
 * 3. Prevention of duplicate reviews
 * 4. Authoritative verified_purchase marking
 */
export async function submitReview(
  productId: string,
  data: { rating: number; title: string; comment: string; isEdit?: boolean; slug?: string }
) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: 'UNAUTHENTICATED',
        message: 'You must be signed in to submit a review.',
      }
    }

    const rating = Math.min(5, Math.max(1, Math.floor(Number(data.rating) || 5)))
    const title = (data.title || '').trim()
    const comment = (data.comment || '').trim()

    if (!title) {
      return { success: false, error: 'VALIDATION_ERROR', message: 'Please enter a review headline.' }
    }
    if (!comment || comment.length < 10) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Please enter at least 10 characters detailing your experience.',
      }
    }

    // 2. Verify that the user purchased the product
    const eligibility = await checkReviewEligibility(productId)
    if (!eligibility.eligible) {
      return {
        success: false,
        error: 'NOT_ELIGIBLE',
        message: eligibility.reason || 'Only verified purchasers of this item are eligible to submit a review.',
      }
    }

    const adminSupabase: any = createAdminClient()

    // 3. Prevent duplicate reviews
    if (eligibility.hasReviewed && !data.isEdit) {
      return {
        success: false,
        error: 'DUPLICATE_REVIEW',
        message: 'You have already submitted a review for this keepsake. You may edit your existing review.',
      }
    }

    // 4. Mark verified_purchase appropriately (true for verified buyers)
    if (eligibility.existingReview?.id) {
      const { error: updateError } = await adminSupabase
        .from('reviews')
        .update({
          rating,
          title,
          comment,
          is_verified_purchase: true,
        })
        .eq('id', eligibility.existingReview.id)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await adminSupabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          title,
          comment,
          is_verified_purchase: true,
        })

      if (insertError) {
        // Handle database unique constraint race conditions gracefully
        if (insertError.code === '23505') {
          return {
            success: false,
            error: 'DUPLICATE_REVIEW',
            message: 'A review for this product has already been recorded.',
          }
        }
        throw insertError
      }
    }

    // Refresh aggregate product rating & count
    const { data: allReviews } = await adminSupabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)

    if (allReviews && allReviews.length > 0) {
      const totalRatings = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0)
      const avgRating = Math.round((totalRatings / allReviews.length) * 10) / 10

      await adminSupabase
        .from('products')
        .update({
          rating: avgRating,
          review_count: allReviews.length,
        })
        .eq('id', productId)
    }

    if (data.slug) {
      revalidatePath(`/product/${data.slug}`)
    }
    revalidatePath('/shop')
    revalidatePath('/admin/reviews')

    return {
      success: true,
      message: eligibility.hasReviewed
        ? 'Your keepsake review has been updated successfully.'
        : 'Your verified review has been published! Thank you.',
    }
  } catch (err: any) {
    console.error('Review submission error:', err)
    return { success: false, error: 'SERVER_ERROR', message: err.message || 'An unexpected error occurred.' }
  }
}
