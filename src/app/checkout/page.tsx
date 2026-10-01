'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { orderService } from '@/lib/services/orderService';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  Gift,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Lock,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, clearCart } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('Emily Davenport');
  const [email, setEmail] = useState('emily.davenport@example.com');
  const [street, setStreet] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Portland');
  const [state, setState] = useState('OR');
  const [zipCode, setZipCode] = useState('97201');
  const [giftNote, setGiftNote] = useState('For little Leo on his 2nd birthday with lots of love!');
  const [includeGiftWrap, setIncludeGiftWrap] = useState(true);

  const total = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast({
        type: 'warning',
        title: 'Empty Basket',
        message: 'Please add toys to your basket before checking out.',
      });
      return;
    }

    setLoading(true);
    try {
      const order = await orderService.createOrder({
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          productImage: i.product.images[0],
          price: i.product.price,
          quantity: i.quantity,
        })),
        subtotal,
        shippingFee,
        total,
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          zipCode,
          country: 'United States',
        },
      });

      // Clear cart
      clearCart();
      setCompletedOrderNumber(order.orderNumber);

      // Celebration Confetti
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#E76F51', '#E9C46A', '#2A9D8F'],
        });
      } catch {
        // ignore
      }

      showToast({
        type: 'success',
        title: 'Order Confirmed! 🎁',
        message: `Order #${order.orderNumber} placed successfully.`,
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Checkout Error',
        message: 'Could not process order. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (completedOrderNumber) {
    return (
      <div className="min-h-screen py-16 bg-[#FDFBF7] flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-md border-2 border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-mono">
            Order #{completedOrderNumber}
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight mt-4">
            Thank You! Your Keepsake Order is Confirmed
          </h1>

          <p className="text-sm text-stone-600 mt-3 leading-relaxed">
            We have sent your confirmation invoice and playtime gift instructions to{' '}
            <strong className="text-stone-900">{email}</strong>. Our workshop team is already
            hand-packing your toys with love and care.
          </p>

          <div className="mt-8 p-5 bg-white rounded-3xl border border-stone-200 text-left space-y-2 text-xs text-stone-600 shadow-sm">
            <div className="flex justify-between">
              <span className="text-stone-400">Shipping To:</span>
              <span className="font-bold text-stone-900">{fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Address:</span>
              <span>{street}, {city}, {state} {zipCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Payment:</span>
              <span className="text-emerald-700 font-semibold">Test Mode (No Charge)</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders">
              <Button size="lg" variant="primary">
                View In Order History
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline">
                Continue Exploring
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Checkout & Gifting
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Complete your shipping details below. (Payment is simulated for this release).
          </p>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Shipping & Gifting Form */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Contact & Delivery */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF5F2] text-[#E76F51] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">
                    Shipping & Parent Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Street Address"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                  <Input
                    label="ZIP Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Step 2: Gift Wrap & Note */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">
                    Complimentary Gifting Touches
                  </h2>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGiftWrap}
                    onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E76F51] focus:ring-[#E76F51] accent-[#E76F51]"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-800">
                      Include Handcrafted Kraft Gift Box & Ribbon
                    </p>
                    <p className="text-[11px] text-stone-500">
                      100% free of charge on all orders
                    </p>
                  </div>
                </label>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Handwritten Card Message (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Write a sweet message to be handwritten by our studio..."
                    className="w-full text-xs rounded-2xl bg-stone-50 border border-stone-200 p-3.5 text-stone-900 focus:outline-none focus:border-[#E76F51]"
                  />
                </div>
              </div>

              {/* Step 3: Payment Notice */}
              <div className="bg-stone-50 rounded-3xl p-6 border-2 border-dashed border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Payment Gateway Placeholder</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  As requested, actual payment gateways (Stripe/Supabase payments) are staged for the next phase.
                  Clicking the button below will securely record your order and generate tracking details.
                </p>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-stone-900">
                Order Review ({items.length} items)
              </h3>

              {/* Items Preview */}
              <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 pt-4 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gift Boxing</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-baseline justify-between">
                <span className="text-base font-bold text-stone-900">Total</span>
                <span className="text-2xl font-black text-stone-900">
                  {formatPrice(total)}
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={loading}
                className="w-full"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Place Heirloom Order • {formatPrice(total)}
              </Button>

              <p className="text-center text-[11px] text-stone-400">
                By placing this order you agree to our 100-Day Playroom Policy.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
