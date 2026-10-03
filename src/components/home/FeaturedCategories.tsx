'use client';

import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/mock-data';
import { CategoryCard } from '../product/CategoryCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FeaturedCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thoughtfully Segmented Play</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Curated by Play & Stage
            </h2>
            <p className="text-sm text-stone-500 mt-2 max-w-lg">
              Explore Montessori wood, soothing linen buddies, and brain puzzles tailored to each phase of your child&apos;s natural curiosity.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#E63946] hover:text-[#D62828] transition group"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
