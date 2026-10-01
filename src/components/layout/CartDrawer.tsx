'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '../ui/Button';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Sparkles, Truck } from 'lucide-react';

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
  } = useCart();

  const progress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

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
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-stone-200/80"
          >
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FFF5F2] text-[#E76F51] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-lg">Your Toy Basket</h3>
                  <p className="text-xs text-stone-500 font-medium">{itemCount} items selected</p>
                </div>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-stone-500 hover:text-stone-900 transition"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="p-4 bg-[#FDFAF6] border-b border-stone-200/60">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#E76F51]" />
                  {amountToFreeShipping > 0
                    ? `Add ${formatPrice(amountToFreeShipping)} more for FREE standard shipping`
                    : '🎉 You qualified for FREE Standard Shipping!'}
                </span>
                <span className="text-[#E76F51] font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-[#E76F51] h-full rounded-full"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-stone-800">Your basket is empty</h4>
                  <p className="text-xs text-stone-500 mt-1.5 max-w-xs">
                    Explore our curated collection of wooden toys, soft plushies, and Montessori puzzles.
                  </p>
                  <Button
                    onClick={() => setCartDrawerOpen(false)}
                    variant="primary"
                    size="sm"
                    className="mt-5"
                  >
                    Start Exploring
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                    {/* Item Thumbnail */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      onClick={() => setCartDrawerOpen(false)}
                      className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <Link
                            href={`/product/${item.product.slug}`}
                            onClick={() => setCartDrawerOpen(false)}
                            className="font-bold text-stone-900 text-sm hover:text-[#E76F51] transition line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-rose-500 p-1 -mr-1 transition"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-stone-500 font-medium">
                          {formatPrice(item.product.price)} each
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Pill */}
                        <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-extrabold text-stone-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
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
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-stone-900">
                      {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-stone-900">Total</span>
                  <span className="text-xl font-black text-stone-900">
                    {formatPrice(subtotal + shippingFee)}
                  </span>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/checkout"
                    onClick={() => setCartDrawerOpen(false)}
                    className="w-full"
                  >
                    <Button size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Checkout Now
                    </Button>
                  </Link>

                  <Link
                    href="/cart"
                    onClick={() => setCartDrawerOpen(false)}
                    className="w-full"
                  >
                    <Button variant="outline" size="md" className="w-full">
                      View Basket Page
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
