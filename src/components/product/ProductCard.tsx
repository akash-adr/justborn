'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ProductBadgeTag, AgeBadge } from '../ui/Badge';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
}

export function ProductCard({ product, onQuickView, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imageIndex, setImageIndex] = useState(0);
  const wishlisted = isInWishlist(product.id);

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col rounded-3xl bg-white border border-stone-200/70 p-3.5 warm-shadow transition-shadow hover:shadow-xl hover:shadow-stone-200/50"
    >
      {/* Image Container */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-stone-100"
        onMouseEnter={() => {
          if (product.images.length > 1) setImageIndex(1);
        }}
        onMouseLeave={() => setImageIndex(0)}
      >
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[imageIndex] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
          />
        </Link>

        {/* Floating Badges (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
          {product.badges.slice(0, 1).map((b) => (
            <ProductBadgeTag key={b} badge={b} />
          ))}
          {discountPercentage && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">
              Save {discountPercentage}%
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
            wishlisted
              ? 'bg-rose-50 text-rose-500 ring-2 ring-rose-200'
              : 'bg-white/90 text-stone-600 hover:text-rose-500 hover:bg-white backdrop-blur-sm'
          }`}
          aria-label={wishlisted ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              wishlisted ? 'fill-rose-500' : ''
            }`}
          />
        </button>

        {/* Quick View Button (Shows on Hover) */}
        {onQuickView && (
          <div className="absolute inset-x-3 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="pointer-events-auto text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/95 text-stone-800 shadow-md backdrop-blur-md hover:bg-white transition flex items-center gap-1.5 border border-stone-100 active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 pt-3.5 px-1 pb-1">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <AgeBadge age={product.ageGroup} />
          <div className="flex items-center gap-1 text-xs font-semibold text-stone-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-stone-400 font-normal">({product.reviewCount})</span>
          </div>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="group-hover:text-[#E76F51] transition-colors"
        >
          <h3 className="font-bold text-stone-900 text-base line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-normal">
          {product.tagline}
        </p>

        {/* Price & Add to Cart */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-stone-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1, true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#FFF2EE] text-[#D65A3B] hover:bg-[#E76F51] hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
            aria-label={`Add ${product.name} to bag`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
