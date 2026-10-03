'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Lock,
  MessageSquare,
  Sparkles,
  Loader2,
  ChevronDown,
  UserCheck,
} from 'lucide-react'
import { checkReviewEligibility, submitReview, ReviewEligibilityResult } from '@/app/actions/review'
import Link from 'next/link'

interface ReviewItem {
  id: string
  productId?: string
  authorName: string
  authorRole?: string
  verifiedPurchase: boolean
  rating: number
  title: string
  content: string
  date: string
}

interface ReviewSectionProps {
  productId: string
  productSlug: string
  initialReviews: ReviewItem[]
  productRating: number
  reviewCount: number
}

const RATING_LABELS: Record<number, string> = {
  5: 'Exceptional — Heirloom Masterpiece',
  4: 'Great — Little One Loves It',
  3: 'Average — Met Basic Expectations',
  2: 'Fair — Room for Improvement',
  1: 'Disappointing — Needed Attention',
}

export function ReviewSection({
  productId,
  productSlug,
  initialReviews,
  productRating,
  reviewCount,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)
  const [formOpen, setFormOpen] = useState(false)
  const [eligibility, setEligibility] = useState<ReviewEligibilityResult | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form Fields
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Load eligibility on component mount or form toggle
  const checkEligibility = async () => {
    try {
      setCheckingEligibility(true)
      const res = await checkReviewEligibility(productId)
      setEligibility(res)
      if (res.existingReview) {
        setRating(res.existingReview.rating || 5)
        setTitle(res.existingReview.title || '')
        setComment(res.existingReview.comment || '')
      }
    } catch (err) {
      console.error('Failed to check review eligibility', err)
    } finally {
      setCheckingEligibility(false)
    }
  }

  useEffect(() => {
    checkEligibility()
  }, [productId])

  // Aggregate Rating Calculation
  const totalReviews = reviews.length
  const currentAvgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
      : (productRating || 5.0).toFixed(1)

  // Distribution Bars (1 to 5 stars)
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : star === 5 ? 100 : 0
    return { star, count, percentage }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!title.trim()) {
      setFormError('Please provide a title for your review.')
      return
    }
    if (!comment.trim() || comment.trim().length < 10) {
      setFormError('Please share at least 10 characters detailing your experience.')
      return
    }

    startTransition(async () => {
      const res = await submitReview(productId, {
        rating,
        title,
        comment,
        isEdit: !!eligibility?.existingReview,
        slug: productSlug,
      })

      if (!res.success) {
        setFormError(res.message || res.error || 'Failed to submit review.')
        return
      }

      setFormSuccess(res.message || 'Your verified review has been posted!')

      // Optimistically update list
      const optimisticReview: ReviewItem = {
        id: `opt-${Date.now()}`,
        productId,
        authorName: 'You (Verified Buyer)',
        authorRole: 'Parent Reviewer',
        verifiedPurchase: true,
        rating,
        title,
        content: comment,
        date: new Date().toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }

      setReviews((prev) => [optimisticReview, ...prev.filter((r) => r.id !== optimisticReview.id)])
      setTimeout(() => {
        setFormOpen(false)
        setFormSuccess(null)
      }, 2000)
    })
  }

  return (
    <div id="reviews" className="mt-20 border-t border-stone-200/80 pt-16 space-y-12">
      {/* Header & Overall Rating Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#E63946] text-xs font-bold mb-3 border border-red-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Parent Experience & Feedback</span>
          </div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">Verified Reviews</h2>
          <p className="text-sm text-stone-500 mt-1">
            Real stories and developmental feedback from families with this keepsake.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormOpen(!formOpen)
            if (!eligibility) checkEligibility()
          }}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#D62828] text-white text-xs font-bold px-6 py-3 rounded-full shadow-sm transition shrink-0 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          {formOpen ? 'Close Form' : eligibility?.existingReview ? 'Edit Your Review' : 'Write a Review'}
        </button>
      </div>

      {/* Aggregate Rating Summary Card */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Big Score */}
        <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-stone-100 pb-6 md:pb-0 md:pr-8">
          <div className="text-5xl font-black text-stone-900">{currentAvgRating}</div>
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.round(Number(currentAvgRating))
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-stone-100 text-stone-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-stone-500">
            Based on <strong className="text-stone-800">{totalReviews}</strong> customer reviews
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified Purchases
          </div>
        </div>

        {/* Right: Distribution Bars */}
        <div className="md:col-span-8 space-y-2 text-xs">
          {distribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="font-bold text-stone-600 w-12 flex items-center gap-1">
                {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </span>
              <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-[11px] text-stone-400 font-mono w-10 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Form / Eligibility Notice */}
      {formOpen && (
        <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 sm:p-8 shadow-md transition-all animate-in fade-in">
          {checkingEligibility ? (
            <div className="py-12 text-center text-stone-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
              <span className="text-xs font-bold">Verifying order eligibility...</span>
            </div>
          ) : !eligibility?.authenticated ? (
            /* Unauthenticated Visitor State */
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">Sign In to Leave a Review</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                  Only verified customers who ordered this heirloom toy can leave authentic reviews.
                </p>
              </div>
              <Link
                href={`/login?redirect=/product/${productSlug}`}
                className="inline-flex items-center gap-2 bg-[#E63946] text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-[#D62828] transition"
              >
                Sign In to Your Account
              </Link>
            </div>
          ) : !eligibility.eligible ? (
            /* Authenticated but Has Not Purchased State */
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900">Verified Purchase Required</h3>
                <p className="text-xs text-stone-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                  {eligibility.reason ||
                    'Our community values genuine customer feedback. Only families who have ordered and received this toy can submit a verified purchase review.'}
                </p>
              </div>
              <p className="text-[11px] text-stone-400">
                Ordered previously under another email? Sign in with that account to unlock reviews.
              </p>
            </div>
          ) : (
            /* Eligible Verified Buyer Submission Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    {eligibility.existingReview ? 'Update Your Keepsake Review' : 'Share Your Family Experience'}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Heirloom Purchaser
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* 1. Interactive Star Rating */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">Overall Rating *</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverRating || rating) >= star
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-stone-300 hover:scale-110 transition cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              active ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <span className="text-xs font-extrabold text-stone-800 ml-2">
                    {RATING_LABELS[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* 2. Review Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">Review Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gorgeous craftsmanship, keeps my toddler engaged for hours!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-[#E63946]"
                />
              </div>

              {/* 3. Review Comment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">Detailed Feedback *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell other parents about wood quality, child interaction, safety, and why it became an heirloom in your home..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-[#E63946]"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#D62828] text-white text-xs font-bold px-7 py-3 rounded-full transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending ? 'Publishing...' : 'Submit Verified Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-5 py-3 rounded-full transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-stone-900">
          Customer Testimonials ({reviews.length})
        </h3>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-2xs space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-stone-100 text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-stone-900 text-sm leading-snug">{rev.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed mt-1.5">{rev.content}</p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span className="font-bold text-stone-700">{rev.authorName}</span>
                  <span className="font-mono text-[11px]">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <h4 className="text-base font-black text-stone-900">No Reviews Yet</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Be the first verified customer to share how your little explorer enjoys this keepsake!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
