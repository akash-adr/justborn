'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ProductBadgeTag, AgeBadge } from '../ui/Badge';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Star, Heart, Check, ShieldCheck, Sparkles, ArrowRight, Minus, Plus } from 'lucide-react';

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const wishlisted = isInWishlist(product.id);

  const handleAdd = () => {
    addToCart(product, qty, true);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[selectedImg] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.badges.map((b) => (
                <ProductBadgeTag key={b} badge={b} />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                    selectedImg === i ? 'border-[#E63946]' : 'border-stone-200 opacity-70'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {product.category}
            </span>
            <AgeBadge age={product.ageGroup} />
          </div>

          <h2 className="text-2xl font-extrabold text-stone-900 leading-tight">
            {product.name}
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-stone-700">{product.rating}</span>
            <span className="text-xs text-stone-400">({product.reviewCount} parent reviews)</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-stone-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-stone-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-xs text-stone-600 mt-3 leading-relaxed">
            {product.description}
          </p>

          {/* Quick Perks */}
          <div className="mt-4 pt-4 border-t border-stone-100 space-y-1.5 text-xs text-stone-600 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified 100% Non-Toxic & Child-Safe Finishes</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E63946]" />
              <span>Heirloom construction built for decades of wonder</span>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-200 rounded-full p-1 bg-stone-50">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-stone-700 disabled:opacity-40 transition cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-stone-900">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(product.stockCount ?? 99, q + 1))
                  }
                  disabled={qty >= (product.stockCount ?? 99)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                    qty < (product.stockCount ?? 99)
                      ? 'hover:bg-white text-stone-700 cursor-pointer'
                      : 'opacity-30 cursor-not-allowed text-stone-300'
                  }`}
                  aria-label="Increase quantity"
                  title={qty >= (product.stockCount ?? 99) ? 'Maximum available stock reached' : 'Increase quantity'}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 rounded-full border transition cursor-pointer ${
                  wishlisted
                    ? 'bg-red-50 border-red-200 text-[#E63946]'
                    : 'border-stone-200 text-stone-500 hover:text-[#E63946]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-[#E63946]' : ''}`} />
              </button>
            </div>

            <div className="flex gap-2.5">
              <Button
                onClick={handleAdd}
                size="lg"
                disabled={!product.inStock || (product.stockCount ?? 1) <= 0}
                className="flex-1"
              >
                {!product.inStock || (product.stockCount ?? 1) <= 0
                  ? 'Out of Stock'
                  : `Add to Basket • ${formatPrice(product.price * qty)}`}
              </Button>
            </div>

            <div className="text-center mt-1">
              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#E63946] hover:underline"
              >
                <span>View Full Toy Specifications & Story</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
