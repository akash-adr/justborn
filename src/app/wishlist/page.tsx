'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      addToCart(item, 1, false);
    });
    showToast({
      type: 'success',
      title: 'Added All to Basket! 🎁',
      message: `${items.length} wishlist toys added to your basket.`,
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            iconType="wishlist"
            title="Your Wishlist is Empty"
            description="Tap the little heart on any wooden toy, linen buddy, or craft kit to keep your nursery favorites organized."
            actionLabel="Discover Keepsake Toys"
            actionHref="/shop"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>Saved Keepsakes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              My Saved Wishlist ({items.length})
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Toys you have saved for upcoming birthdays, milestones, and nursery gifting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddAllToCart}
              size="sm"
              variant="primary"
              leftIcon={<ShoppingBag className="w-4 h-4" />}
            >
              Add All to Basket
            </Button>
            <Button
              onClick={clearWishlist}
              size="sm"
              variant="ghost"
              className="text-stone-400 hover:text-stone-700"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
