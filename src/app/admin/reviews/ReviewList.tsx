'use client'

import { useState } from 'react'
import { deleteReviewAction } from '../actions'
import { Star, Trash2, CheckCircle2, Search, StarHalf } from 'lucide-react'
import Link from 'next/link'

interface ReviewListProps {
  reviews: any[]
}

export function ReviewList({ reviews: initialReviews }: ReviewListProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [search, setSearch] = useState('')

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this review from public display?')) return

    try {
      const res = await deleteReviewAction(id)
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id))
      } else {
        alert(res.error || 'Failed to remove review')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const filtered = reviews.filter((r) => {
    const prodName = r.products?.name || ''
    const comment = r.comment || ''
    const title = r.title || ''
    return (
      prodName.toLowerCase().includes(search.toLowerCase()) ||
      comment.toLowerCase().includes(search.toLowerCase()) ||
      title.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-4 sm:p-5 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search reviews by toy title or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-stone-200 focus:outline-none focus:border-[#E63946]"
          />
        </div>
        <span className="text-xs font-bold text-stone-500">
          Showing {filtered.length} of {reviews.length} reviews
        </span>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-400 font-bold uppercase text-[10px]">
                <th className="p-4">Toy Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Customer Review</th>
                <th className="p-4">Verified Purchase</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((rev) => (
                <tr key={rev.id} className="hover:bg-stone-50/50 transition">
                  <td className="p-4 font-bold text-stone-900 max-w-[200px]">
                    <p className="truncate">{rev.products?.name || 'Unknown Product'}</p>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current' : 'text-stone-300'
                          }`}
                        />
                      ))}
                      <span className="text-stone-700 font-bold ml-1 text-xs">
                        {rev.rating}.0
                      </span>
                    </div>
                  </td>

                  <td className="p-4 max-w-sm">
                    {rev.title && <p className="font-extrabold text-stone-900">{rev.title}</p>}
                    <p className="text-stone-600 line-clamp-2 mt-0.5">
                      {rev.comment || 'No comment text provided.'}
                    </p>
                  </td>

                  <td className="p-4">
                    {rev.is_verified_purchase ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-stone-400">Standard</span>
                    )}
                  </td>

                  <td className="p-4 text-stone-500 whitespace-nowrap">
                    {new Date(rev.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    No customer reviews found.
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
