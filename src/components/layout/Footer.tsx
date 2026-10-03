'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/mock-data';
import { useToast } from '@/context/ToastContext';
import { Sparkles, Heart, ShieldCheck, Leaf, PackageCheck, Send } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    showToast({
      type: 'success',
      title: 'Welcome to the Just Born Family! 💌',
      message: 'Your ₹500 welcome voucher code has been sent to your inbox.',
    });
    setEmail('');
  };

  return (
    <footer className="bg-white text-stone-600 pt-16 pb-12 mt-20 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-14 border-b border-stone-200/80">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-red-50/40 border border-red-100/60">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs text-[#D9232E] flex items-center justify-center shrink-0 border border-red-100">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">100% Non-Toxic</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Natural beeswax, organic plant dyes, and sustainably sourced solid wood.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-red-50/40 border border-red-100/60">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs text-[#D9232E] flex items-center justify-center shrink-0 border border-red-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">100-Day Play Guarantee</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                If your child doesn’t fall in love, return for a hassle-free full exchange.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-red-50/40 border border-red-100/60">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs text-[#D9232E] flex items-center justify-center shrink-0 border border-red-100">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Plastic-Free Delivery</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Dispatched in recycled cartons, cotton ribbons, and soy-ink gift boxes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-red-50/40 border border-red-100/60">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs text-[#D9232E] flex items-center justify-center shrink-0 border border-red-100">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Heirloom Durability</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Crafted to withstand toddler tosses and be passed to future generations.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14 border-b border-stone-200/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#D9232E] flex items-center justify-center text-white shadow-sm shadow-red-500/20">
                <Sparkles className="w-4 h-4 fill-white/20" />
              </div>
              <span className="text-2xl font-black tracking-tight text-stone-900">
                Just Born
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm leading-relaxed">
              We curate timeless, sensorial, open-ended play for curious children and mindful parents across India.
              Every piece honors childhood wonder and respects our planet.
            </p>
            <div className="pt-2 text-xs text-stone-500 space-y-1">
              <p><strong className="text-stone-800">Flagship Studio:</strong> 12 Indiranagar 100ft Road, Bengaluru</p>
              <p><strong className="text-stone-800">Concierge:</strong> hello@justborn-toys.in</p>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 tracking-wider uppercase mb-4">
              Explore Toys
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-500">
              <li>
                <Link href="/shop" className="hover:text-[#D9232E] transition">All Collections</Link>
              </li>
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/shop?category=${cat.slug}`} className="hover:text-[#D9232E] transition">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 tracking-wider uppercase mb-4">
              Care & Help
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-500">
              <li>
                <Link href="/orders" className="hover:text-[#D9232E] transition">Track Delivery</Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#D9232E] transition">Parent Account</Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#D9232E] transition">Saved Wishlist</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#D9232E] transition font-semibold">Store Admin Panel</Link>
              </li>
              <li>
                <span className="text-stone-400 cursor-default">Safety & Testing (BIS / ASTM)</span>
              </li>
              <li>
                <span className="text-stone-400 cursor-default">Gifting Concierge</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 tracking-wider uppercase mb-3">
              The Playroom Letter
            </h4>
            <p className="text-xs text-stone-500 mb-3 leading-relaxed">
              Get ₹500 off your first keepsake toy, milestone guides, and early access to handcrafted drops.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter parent email..."
                  required
                  className="w-full text-xs rounded-2xl bg-stone-50 border border-stone-200 px-3.5 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#D9232E]"
                />
              </div>
              <button
                type="submit"
                className="w-full text-xs font-bold py-2.5 px-4 rounded-2xl bg-[#D9232E] hover:bg-[#D62828] text-white transition flex items-center justify-center gap-1.5 shadow-sm shadow-red-500/20 cursor-pointer"
              >
                <span>Join Letter</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Just Born Toys India Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>BIS Toy Safety Certified (IS 9873)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
