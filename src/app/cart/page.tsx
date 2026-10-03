'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CouponBox } from '@/components/cart/CouponBox';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  Heart,
  Tag,
  AlertCircle,
  RotateCcw,
  Check,
  X,
  PackageCheck,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
    freeShippingThreshold,
    shippingFee,
    appliedPromo,
    discountAmount,
    finalTotal,
    applyPromoCode,
    removePromoCode,
    canIncreaseQuantity,
  } = useCart();

  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const progress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const result = await applyPromoCode(promoInput);
    if (result.success) {
      setPromoMessage({ text: result.message, error: false });
      setPromoInput('');
    } else {
      setPromoMessage({ text: result.message, error: true });
    }
  };

  const handleMoveToWishlist = (item: (typeof items)[0]) => {
    if (!isInWishlist(item.product.id)) {
      toggleWishlist(item.product);
    }
    removeFromCart(item.id);
  };

  // Beautiful Empty Cart State
  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-[#faf9f6]">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            iconType="cart"
            title="Your Toy Basket is Waiting"
            description="Your playroom basket is empty. Browse our heirloom wooden toys, organic plush companions, and creative puzzles designed for joyful development."
            actionLabel="Discover Keepsake Toys"
            actionHref="/shop"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-2">
            <Link href="/" className="hover:text-stone-700 transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-stone-800">Your Basket</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight">
                Playroom Basket ({itemCount})
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Hand-packed with care, eco-friendly materials, and non-toxic packaging.
              </p>
            </div>

            <button
              onClick={clearCart}
              className="text-xs font-semibold text-stone-400 hover:text-rose-600 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Empty Basket</span>
            </button>
          </div>
        </div>

        {/* Free Shipping Milestone Alert */}
        <div className="mb-8 bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
            <div className="font-semibold text-stone-800 flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-red-50 text-[#E63946] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              {amountToFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-[#E63946]">{formatPrice(amountToFreeShipping)}</strong> more of heirloom play to qualify for{' '}
                  <strong className="text-stone-900">Free Express Delivery</strong>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-600" />
                  Congratulations! You unlocked complimentary Express Nursery Delivery.
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-stone-500">{progress}% to Free Shipping</span>
          </div>
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-gradient-to-r from-[#E63946] to-[#FF6B6B] h-full rounded-full"
            />
          </div>
        </div>

        {/* Main Grid: Left Items List, Right Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (Left Column) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-6">
            <div className="divide-y divide-stone-100">
              <AnimatePresence>
                {items.map((item) => {
                  const maxStock = item.product.stockCount ?? 99;
                  const isMaxReached = item.quantity >= maxStock;
                  const isLowStock = maxStock <= 5;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                    >
                      {/* Product Thumbnail & Meta */}
                      <div className="flex items-center gap-4 min-w-0">
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/70 relative group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                            {item.product.category}
                          </span>
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-bold text-stone-900 text-base hover:text-[#E63946] transition line-clamp-1"
                          >
                            {item.product.name}
                          </Link>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-stone-700">
                              {formatPrice(item.product.price)} each
                            </span>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <span className="text-[11px] text-stone-400 line-through">
                                {formatPrice(item.product.originalPrice)}
                              </span>
                            )}
                          </div>

                          {/* Stock Validation UI Notice */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {isMaxReached ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                Max available stock reached ({maxStock})
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200/60 px-2.5 py-0.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-orange-500" />
                                Only {maxStock} left in stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3 text-emerald-600" />
                                In Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls: Quantity, Line Price, Actions */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-5 sm:justify-end">
                        {/* Quantity Controller with Stock Validation */}
                        <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={!canIncreaseQuantity(item.id)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                              canIncreaseQuantity(item.id)
                                ? 'hover:bg-white text-stone-700 cursor-pointer'
                                : 'opacity-30 cursor-not-allowed text-stone-300'
                            }`}
                            aria-label="Increase quantity"
                            title={!canIncreaseQuantity(item.id) ? 'Max inventory reached' : 'Increase quantity'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="text-right min-w-[75px]">
                          <span className="font-extrabold text-base text-stone-900 block">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                        {/* Actions: Move to Wishlist & Remove */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveToWishlist(item)}
                            className="text-stone-400 hover:text-[#E63946] p-2 rounded-full hover:bg-red-50 transition cursor-pointer"
                            title="Save for later in Wishlist"
                            aria-label="Move to wishlist"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-300 hover:text-rose-600 p-2 rounded-full hover:bg-stone-100 transition cursor-pointer"
                            title="Remove toy"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Back to Shop Link */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
              <Link
                href="/shop"
                className="font-bold text-[#E63946] hover:underline flex items-center gap-1.5"
              >
                ← Continue Exploring Toys
              </Link>
              <span className="text-stone-400 font-medium">
                {items.length} unique item{items.length !== 1 ? 's' : ''} in basket
              </span>
            </div>
          </div>

          {/* Order Summary & Checkout (Right Column) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-6 sticky top-28">
            <h2 className="text-xl font-bold text-stone-900">Order Summary</h2>

            {/* Promo Code Box */}
            <CouponBox
              subtotal={subtotal}
              appliedCoupon={
                appliedPromo
                  ? {
                      code: appliedPromo.code,
                      type: appliedPromo.type,
                      value: appliedPromo.value,
                      discountAmount,
                      description: appliedPromo.description,
                    }
                  : null
              }
              onApply={(coupon) => {
                applyPromoCode(coupon.code)
              }}
              onRemove={removePromoCode}
            />

            {/* Breakdown */}
            <div className="space-y-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({itemCount} units)</span>
                <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Savings ({appliedPromo?.code})
                  </span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-stone-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>GST / Taxes</span>
                <span className="font-semibold text-stone-900">Included in prices</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-stone-100 flex items-baseline justify-between">
              <div>
                <span className="text-base font-bold text-stone-900 block">Total Due</span>
                <span className="text-[11px] text-stone-400">Includes complimentary heirloom gift box</span>
              </div>
              <span className="text-2xl font-black text-stone-900">
                {formatPrice(finalTotal)}
              </span>
            </div>

            {/* Checkout CTA */}
            <Link
              href={user ? '/checkout' : '/login?redirect=/checkout'}
              className="block w-full"
            >
              <Button
                size="lg"
                className="w-full bg-[#D9232E] hover:bg-[#BF1620] shadow-md shadow-red-600/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {user ? 'Proceed to Checkout' : 'Checkout'} • {formatPrice(finalTotal)}
              </Button>
            </Link>

            {!user && (
              <p className="text-xs font-semibold text-center text-stone-500 mt-2">
                Sign in to continue to checkout
              </p>
            )}

            {/* Trust Assurances */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5 text-[11px] text-stone-500 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>256-bit Encrypted SSL Checkout with Razorpay</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E63946] shrink-0" />
                <span>100-Day Play Guarantee on all heirloom pieces</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-stone-400 shrink-0" />
                <span>Hassle-free 30-day returns & exchanges</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
