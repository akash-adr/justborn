'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useToast } from '@/context/ToastContext';
import { Gift, Copy, Check, ArrowRight } from 'lucide-react';

export function PromoBanner() {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('HEIRLOOM500');
    setCopied(true);
    showToast({
      type: 'success',
      title: 'Promo Code Copied! 🎉',
      message: 'Code HEIRLOOM500 copied to clipboard. Paste at checkout for ₹500 off.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#E63946] via-[#D62828] to-[#BA181B] text-white p-8 sm:p-12 lg:p-14 shadow-xl clean-shadow-lg"
        >
          {/* Background Decorative Rings */}
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-white/15 pointer-events-none" />
          <div className="absolute right-20 -bottom-20 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold">
                <Gift className="w-3.5 h-3.5" />
                <span>Complimentary Handcrafted Gift Wrap</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Gift Pure Childhood Wonder.
                <br />
                <span className="text-amber-200">Save ₹500 on Orders Over ₹2,999.</span>
              </h2>

              <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed">
                Every order across India comes packaged in bespoke recycled kraft gift boxes tied with cotton ribbon,
                ready for birthdays, ceremonies, or nursery surprises.
              </p>

              {/* Promo code badge */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-black/25 backdrop-blur-md border border-white/25 px-4 py-2 rounded-2xl">
                  <span className="text-xs text-white/80 font-semibold">Use code:</span>
                  <span className="text-sm font-black text-amber-300 font-mono tracking-wider">
                    HEIRLOOM500
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
                    title="Copy promo code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <span className="text-xs text-white/80 font-medium">Valid on all wooden & plush collections</span>
              </div>
            </div>

            {/* Right Action */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end items-start lg:items-end">
              <Link href="/shop" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm bg-white text-[#E63946] hover:bg-stone-100 shadow-md transition active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer">
                  <span>Shop Gifting Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/shop?category=sensory-baby" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 py-2.5 rounded-full font-semibold text-xs text-white hover:bg-white/10 transition cursor-pointer">
                  Newborn Gift Ideas
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
