'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '../ui/Button';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  Truck,
  Heart,
  AlertCircle,
  Tag,
} from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    cartDrawerOpen,
    setCartDrawerOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    itemCount,
    freeShippingThreshold,
    shippingFee,
    appliedPromo,
    discountAmount,
    finalTotal,
    canIncreaseQuantity,
  } = useCart();

  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const progress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleMoveToWishlist = (item: (typeof items)[0]) => {
    if (!isInWishlist(item.product.id)) {
      toggleWishlist(item.product);
    }
    removeFromCart(item.id);
  };

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-stone-200/80"
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-red-50 text-[#E63946] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg leading-tight">Your Toy Basket</h3>
                  <p className="text-xs text-stone-500 font-medium">{itemCount} items selected</p>
                </div>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                aria-label="Close basket"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Shipping Milestone Indicator */}
            {items.length > 0 && (
              <div className="px-5 py-3.5 bg-red-50/50 border-b border-red-100/70 shrink-0">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#E63946]" />
                    {amountToFreeShipping > 0 ? (
                      <>
                        Add{' '}
                        <strong className="text-[#E63946]">
                          {formatPrice(amountToFreeShipping)}
                        </strong>{' '}
                        for <span className="text-[#E63946] font-bold">FREE Delivery</span>
                      </>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        You unlocked Free Express Delivery!
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-bold text-stone-500">{progress}%</span>
                </div>
                <div className="w-full bg-stone-200/70 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-[#E63946] to-[#FF6B6B] h-full rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-stone-100">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-[#E63946]">
                      <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
                    </div>
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#E63946] text-white flex items-center justify-center text-xs shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </motion.div>
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-lg mb-1">Your Basket is Empty</h4>
                    <p className="text-stone-500 text-xs max-w-xs leading-relaxed">
                      Looks like your play basket is waiting for some heirloom wonders, wooden puzzles, or soft plush companions.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    onClick={() => setCartDrawerOpen(false)}
                    className="pt-2"
                  >
                    <Button variant="primary" size="md">
                      Explore All Toys
                    </Button>
                  </Link>
                </div>
              ) : (
                items.map((item) => {
                  const maxStock = item.product.stockCount ?? 99;
                  const isMaxReached = item.quantity >= maxStock;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="pt-4 first:pt-0 flex gap-3.5 group"
                    >
                      {/* Image */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={() => setCartDrawerOpen(false)}
                        className="w-18 h-18 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/70 relative"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <Link
                              href={`/product/${item.product.slug}`}
                              onClick={() => setCartDrawerOpen(false)}
                              className="font-bold text-stone-900 text-sm hover:text-[#E63946] transition line-clamp-1"
                            >
                              {item.product.name}
                            </Link>

                            <div className="flex items-center gap-1 -mr-1">
                              {/* Move to Wishlist */}
                              <button
                                onClick={() => handleMoveToWishlist(item)}
                                className="text-stone-400 hover:text-[#E63946] p-1 transition cursor-pointer"
                                title="Move to saved favorites"
                              >
                                <Heart className="w-3.5 h-3.5" />
                              </button>
                              {/* Remove Item */}
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-stone-400 hover:text-rose-500 p-1 transition cursor-pointer"
                                title="Remove from basket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-stone-500 font-medium">
                              {formatPrice(item.product.price)}
                            </span>
                            {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                              <span className="text-[11px] text-stone-400 line-through">
                                {formatPrice(item.product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stock Validation UI Notice */}
                        {isMaxReached && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md w-fit">
                            <AlertCircle className="w-3 h-3" />
                            Max available stock ({maxStock})
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2.5">
                          {/* Quantity Pill */}
                          <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-bold text-xs text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={!canIncreaseQuantity(item.id)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition ${
                                canIncreaseQuantity(item.id)
                                  ? 'hover:bg-white text-stone-700 cursor-pointer'
                                  : 'opacity-30 cursor-not-allowed text-stone-300'
                              }`}
                              aria-label="Increase quantity"
                              title={!canIncreaseQuantity(item.id) ? 'Max inventory reached' : 'Increase quantity'}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-extrabold text-stone-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-5 border-t border-stone-200/80 bg-stone-50/70 space-y-3 shrink-0">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && appliedPromo && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Promo ({appliedPromo.code})
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
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-900">Total</span>
                  <span className="text-xl font-black text-stone-900">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href={user ? '/checkout' : '/login?redirect=/checkout'}
                    onClick={() => setCartDrawerOpen(false)}
                    className="w-full block"
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
                    <p className="text-[11px] font-semibold text-center text-stone-500">
                      Sign in to continue to checkout
                    </p>
                  )}

                  <Link
                    href="/cart"
                    onClick={() => setCartDrawerOpen(false)}
                    className="w-full block"
                  >
                    <Button variant="outline" size="md" className="w-full">
                      {user ? 'View Full Basket Page' : 'View Cart'}
                    </Button>
                  </Link>
                </div>

                <p className="text-[11px] text-center text-stone-400">
                  🔒 Safe, 256-bit encrypted checkout • 100-Day Play Guarantee
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
