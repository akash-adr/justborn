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
      message: 'Your $15 welcome code has been sent to your inbox.',
    });
    setEmail('');
  };

  return (
    <footer className="bg-[#26221F] text-stone-300 pt-16 pb-12 mt-20 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-14 border-b border-stone-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-800 text-[#E76F51] flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Non-Toxic</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Water-based dyes, natural beeswax, and sustainable European hardwoods.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-800 text-[#E9C46A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100-Day Play Guarantee</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                If your child doesn’t fall in love, return for an easy full exchange.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-800 text-[#2A9D8F] flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Plastic-Free Delivery</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Packaged in recycled paper cartons, cotton ribbons, and soy-ink boxes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-800 text-rose-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Heirloom Durability</h4>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Designed to survive toddler tosses and be passed to future generations.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#E76F51] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 fill-white/20" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Just Born
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed">
              We curate timeless, sensorial, open-ended play for modern children and thoughtful parents.
              Every piece honors childhood curiosity and respects our planet.
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-1">
              <p><strong className="text-stone-300">Flagship Studio:</strong> 148 Mulberry Lane, Brooklyn, NY</p>
              <p><strong className="text-stone-300">Concierge:</strong> hello@justborn-toys.com</p>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Explore Toys
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/shop" className="hover:text-white transition">All Play Collections</Link>
              </li>
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link href={`/shop?category=${cat.slug}`} className="hover:text-white transition">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-4">
              Care & Help
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/orders" className="hover:text-white transition">Track My Order</Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition">Parent Account</Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition">Saved Wishlist</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-300 transition">Store Admin Panel</Link>
              </li>
              <li>
                <span className="text-stone-500 cursor-default">Safety & Testing Standards</span>
              </li>
              <li>
                <span className="text-stone-500 cursor-default">Gifting Concierge</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-3">
              The Playroom Letter
            </h4>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Get $15 off your first order, developmental play ideas, and first access to limited drops.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter parent email..."
                  required
                  className="w-full text-xs rounded-2xl bg-stone-800/90 border border-stone-700 px-3.5 py-2.5 text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E76F51]"
                />
              </div>
              <button
                type="submit"
                className="w-full text-xs font-bold py-2.5 px-4 rounded-2xl bg-[#E76F51] hover:bg-[#D65A3B] text-white transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Join Letter</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Just Born Toys Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Child Safety Compliance (ASTM F963 / EN71)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
