'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { REVIEWS } from '@/lib/mock-data';
import { Star, CheckCircle, Quote, Sparkles } from 'lucide-react';

export function CustomerReviews() {
  return (
    <section className="py-20 bg-[#FFFDF9] border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D65A3B] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stories From The Nursery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Loved by 12,000+ Happy Families
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            Read heartfelt thoughts from real parents, early-childhood educators, and proud aunties.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              className="rounded-3xl bg-white border border-stone-200/80 p-6 flex flex-col justify-between warm-shadow"
            >
              <div>
                {/* Rating stars & Quote Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: review.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-stone-300" />
                </div>

                <h4 className="text-sm font-bold text-stone-900 leading-snug mb-2">
                  &ldquo;{review.title}&rdquo;
                </h4>

                <p className="text-xs text-stone-600 leading-relaxed italic">
                  &ldquo;{review.content}&rdquo;
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-stone-900">{review.authorName}</h5>
                  <p className="text-[11px] text-stone-500 font-medium">{review.authorRole}</p>
                </div>
                {review.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
