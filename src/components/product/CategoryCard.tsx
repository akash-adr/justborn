'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/lib/types';
import { ArrowUpRight } from 'lucide-react';

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/shop?category=${category.slug}`} className="block group">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative overflow-hidden rounded-3xl bg-white border border-stone-200/80 p-5 warm-shadow flex flex-col justify-between h-72 transition-shadow hover:shadow-xl"
      >
        {/* Soft Background Tint */}
        <div
          className={`absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60 ${category.bgColor}`}
        />

        {/* Top Header: Badge & Arrow */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur-sm border border-stone-100">
            {category.itemCount} Toys
          </span>
          <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-stone-700 group-hover:bg-[#E76F51] group-hover:text-white transition-colors shadow-sm">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Category Center Illustration / Image */}
        <div className="relative z-10 my-auto flex justify-center py-2">
          <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 bg-stone-100 border-2 border-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Bottom Details */}
        <div className="relative z-10 pt-2 text-center">
          <h3 className="font-extrabold text-stone-900 text-base sm:text-lg group-hover:text-[#E76F51] transition-colors">
            {category.name}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-1 font-medium">
            {category.tagline}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
