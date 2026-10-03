'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductBadgeTag, AgeBadge } from '@/components/ui/Badge';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Star,
  Check,
  Plus,
} from 'lucide-react';

export default function WishlistPage() {
  const { items, removeFromWishlist, moveToCart, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddAllToCart = () => {
    if (items.length === 0) return;
    let addedCount = 0;

    items.forEach((item) => {
      if (item.inStock && (item.stockCount ?? 1) > 0) {
        addToCart(item, 1, false);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      showToast({
        type: 'success',
        title: 'All In-Stock Toys Added! 🎁',
        message: `${addedCount} toys moved to your playroom basket.`,
      });
    } else {
      showToast({
        type: 'warning',
        title: 'Items Unavailable',
        message: 'The items in your wishlist are currently out of stock.',
      });
    }
  };

  const handleMoveAllToCart = () => {
    if (items.length === 0) return;
    const inStockItems = items.filter((item) => item.inStock && (item.stockCount ?? 1) > 0);

    inStockItems.forEach((item) => {
      moveToCart(item, 1);
    });

    if (inStockItems.length > 0) {
      showToast({
        type: 'success',
        title: 'Moved to Basket! 🎁',
        message: `${inStockItems.length} toys transferred to your basket.`,
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-[#faf9f6]">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            iconType="wishlist"
            title="Your Wishlist is Empty"
            description="Tap the heart icon on any wooden toy, sensory play mat, or organic plush to save your family's favorite keepsakes for future celebrations."
            actionLabel="Discover Heirloom Toys"
            actionHref="/shop"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-2">
          <Link href="/" className="hover:text-stone-700 transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-stone-800">Saved Wishlist</span>
        </div>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] uppercase tracking-wider mb-1">
              <Heart className="w-3.5 h-3.5 fill-[#E63946]" />
              <span>Personal Nursery Wishlist</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight">
              Saved Keepsakes ({items.length})
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Toys saved for birthdays, developmental milestones, and baby gifting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handleMoveAllToCart}
              size="sm"
              variant="primary"
              leftIcon={<ShoppingBag className="w-4 h-4" />}
            >
              Move All to Basket
            </Button>
            <Button
              onClick={handleAddAllToCart}
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add All
            </Button>
            <button
              onClick={clearWishlist}
              className="text-xs font-semibold text-stone-400 hover:text-rose-600 transition px-2 py-1 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map((product) => {
              const maxStock = product.stockCount ?? 99;
              const isOutOfStock = !product.inStock || maxStock <= 0;
              const isLowStock = !isOutOfStock && maxStock <= 5;

              const discountPercentage =
                product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : null;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group relative flex flex-col rounded-3xl bg-white border border-stone-200/80 p-4 warm-shadow transition-shadow hover:shadow-xl hover:shadow-stone-200/50"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-stone-100">
                    <Link href={`/product/${product.slug}`} className="block w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </Link>

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
                      {product.badges && product.badges.length > 0 && (
                        <ProductBadgeTag badge={product.badges[0]} />
                      )}
                      {discountPercentage && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E63946] text-white shadow-xs">
                          Save {discountPercentage}%
                        </span>
                      )}
                    </div>

                    {/* Remove From Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-stone-500 hover:text-rose-600 hover:bg-white backdrop-blur-xs flex items-center justify-center transition shadow-xs cursor-pointer"
                      title="Remove from favorites"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Product Information */}
                  <div className="flex flex-col flex-1 pt-3.5 pb-1">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <AgeBadge age={product.ageGroup} />
                      <div className="flex items-center gap-1 text-xs font-semibold text-stone-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <Link
                      href={`/product/${product.slug}`}
                      className="font-bold text-stone-900 text-base line-clamp-1 hover:text-[#E63946] transition-colors"
                    >
                      {product.name}
                    </Link>

                    <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-normal">
                      {product.tagline}
                    </p>

                    {/* Stock Status Indicator */}
                    <div className="mt-2.5">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          <XCircle className="w-3 h-3" />
                          Currently Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <AlertCircle className="w-3 h-3" />
                          Only {maxStock} left in stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          In Stock ({maxStock} available)
                        </span>
                      )}
                    </div>

                    {/* Price and Action Buttons */}
                    <div className="mt-auto pt-4 border-t border-stone-100 flex flex-col gap-2.5">
                      <div className="flex items-baseline justify-between">
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
                      </div>

                      {/* Primary Actions: Move to Basket & Add to Basket */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={isOutOfStock}
                          onClick={() => moveToCart(product, 1)}
                          className="w-full text-xs py-2 px-2"
                        >
                          Move to Basket
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isOutOfStock}
                          onClick={() => addToCart(product, 1, true)}
                          className="w-full text-xs py-2 px-2"
                        >
                          Add to Basket
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
