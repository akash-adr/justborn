'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Truck,
  Sparkles,
  ShieldCheck,
  Tag,
  Check,
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    itemCount,
    freeShippingThreshold,
    shippingFee,
    clearCart,
  } = useCart();

  const { showToast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountName, setDiscountName] = useState<string>('');

  const progress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'JUSTBORN15') {
      const disc = Math.min(15, subtotal);
      setAppliedDiscount(disc);
      setDiscountName('JUSTBORN15 ($15 Welcome Gift)');
      showToast({
        type: 'success',
        title: 'Promo Code Applied! 🎉',
        message: 'Saved $15 on your order.',
      });
    } else if (clean === 'HEIRLOOM15') {
      const disc = Math.round(subtotal * 0.15 * 100) / 100;
      setAppliedDiscount(disc);
      setDiscountName('HEIRLOOM15 (15% Off)');
      showToast({
        type: 'success',
        title: 'Promo Code Applied! 🎉',
        message: `Saved ${formatPrice(disc)} on your order.`,
      });
    } else {
      showToast({
        type: 'error',
        title: 'Invalid Promo Code',
        message: 'Please try JUSTBORN15 or HEIRLOOM15.',
      });
    }
  };

  const finalTotal = Math.max(0, subtotal - appliedDiscount + shippingFee);

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            iconType="cart"
            title="Your Toy Basket is Waiting"
            description="You haven't chosen any playtime treasures yet. Discover our wooden heirloom stackers and soft organic companions."
            actionLabel="Discover Toys"
            actionHref="/shop"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Your Playroom Basket
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Review your items before we hand-wrap your heirloom order.
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-stone-400 hover:text-rose-600 transition"
          >
            Clear Basket
          </button>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="mb-8 p-4 rounded-3xl bg-white border border-stone-200/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#E76F51]" />
              {amountToFreeShipping > 0
                ? `Add ${formatPrice(amountToFreeShipping)} more to receive FREE delivery`
                : '🎉 You have unlocked Free Standard Shipping!'}
            </span>
            <span className="text-[#E76F51] font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="bg-[#E76F51] h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (Left Column) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm divide-y divide-stone-100">
            {items.map((item) => (
              <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                      {item.product.category}
                    </span>
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="font-bold text-stone-900 text-base hover:text-[#E76F51] transition line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {formatPrice(item.product.price)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end">
                  {/* Quantity Controller */}
                  <div className="flex items-center border border-stone-200 rounded-full bg-stone-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white text-stone-700 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[70px]">
                    <span className="font-extrabold text-base text-stone-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-stone-300 hover:text-rose-500 p-1.5 transition"
                    title="Remove toy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout (Right Column) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-stone-900">Order Summary</h2>

            {/* Promo Code Box */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs font-bold text-stone-600 block">
                Gift or Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. JUSTBORN15"
                  className="flex-1 text-xs rounded-2xl bg-stone-50 border border-stone-200 px-3.5 py-2.5 text-stone-900 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:border-[#E76F51]"
                />
                <Button type="submit" size="sm" variant="outline">
                  Apply
                </Button>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Applied: {discountName}
                </p>
              )}
            </form>

            {/* Breakdown */}
            <div className="space-y-3 pt-3 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({itemCount})</span>
                <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(appliedDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span className="font-semibold text-stone-900">
                  {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Sales Tax</span>
                <span className="font-semibold text-stone-900">$0.00</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-stone-100 flex items-baseline justify-between">
              <div>
                <span className="text-base font-bold text-stone-900 block">Total Due</span>
                <span className="text-[11px] text-stone-400">Includes complimentary gift boxing</span>
              </div>
              <span className="text-2xl font-black text-stone-900">
                {formatPrice(finalTotal)}
              </span>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" className="block w-full">
              <Button size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Checkout
              </Button>
            </Link>

            <Link href="/shop" className="block text-center text-xs font-bold text-[#E76F51] hover:underline">
              Continue Shopping
            </Link>

            {/* Assurance */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-[11px] text-stone-500 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-bit Bank Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E76F51]" />
                <span>100-Day Play Guarantee on all items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
