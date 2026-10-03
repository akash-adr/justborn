import { requireAdmin } from '@/lib/auth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ReviewList } from './ReviewList'
import { Star, MessageSquare } from 'lucide-react'

export const metadata = {
  title: 'Customer Reviews | Just Born Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminReviewsPage() {
  await requireAdmin()
  const supabase: any = createAdminClient()

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      products (name, slug)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Admin reviews fetch error:', error)
  }

  const reviewList = reviews || []
  const avgRating =
    reviewList.length > 0
      ? (
          reviewList.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
          reviewList.length
        ).toFixed(1)
      : '5.0'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Customer Reviews</h1>
          <p className="text-sm text-stone-500 mt-1">
            Moderate parent feedback, ratings, and heirloom testimonials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-stone-200/80 px-4 py-2 rounded-full shadow-sm text-xs font-bold text-stone-800">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span>Store Rating: <strong className="text-stone-900">{avgRating} / 5.0</strong></span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-stone-200/80 px-4 py-2 rounded-full shadow-sm text-xs font-bold text-stone-800">
            <MessageSquare className="w-4 h-4 text-[#E63946]" />
            <span>Total Reviews: <strong className="text-stone-900">{reviewList.length}</strong></span>
          </div>
        </div>
      </div>

      <ReviewList reviews={reviewList} />
    </div>
  )
}
