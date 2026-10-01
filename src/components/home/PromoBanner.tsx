'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useToast } from '@/context/ToastContext';
import { Gift, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';

export function PromoBanner() {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('HEIRLOOM15');
    setCopied(true);
    showToast({
      type: 'success',
      title: 'Promo Code Copied! 🎉',
      message: 'Code HEIRLOOM15 copied to clipboard. Paste at checkout for 15% off.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-12 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#26221F] via-[#352F2A] to-[#26221F] text-white p-8 sm:p-12 lg:p-14 shadow-2xl warm-shadow-lg"
        >
          {/* Background Decorative Rings */}
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-stone-700/40 pointer-events-none" />
          <div className="absolute right-20 -bottom-20 w-96 h-96 rounded-full border border-stone-700/20 pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#E76F51]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E76F51]/20 border border-[#E76F51]/30 text-[#F4A261] text-xs font-bold">
                <Gift className="w-3.5 h-3.5" />
                <span>Complimentary Heirloom Gift Wrap</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Gift Pure Childhood Wonder.
                <br />
                <span className="text-[#E9C46A]">Save 15% on Orders Over $100.</span>
              </h2>

              <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed">
                Every order comes packaged in bespoke recycled kraft gift boxes tied with cotton ribbon,
                ready for birthdays, holidays, or joyful nursery surprises.
              </p>

              {/* Promo code badge */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-stone-800/90 border border-stone-700 px-3.5 py-2 rounded-2xl">
                  <span className="text-xs text-stone-400 font-semibold">Use code:</span>
                  <span className="text-sm font-black text-amber-300 font-mono tracking-wider">
                    HEIRLOOM15
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded-lg hover:bg-stone-700 text-stone-300 hover:text-white transition"
                    title="Copy promo code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <span className="text-xs text-stone-400">Valid on all wooden & plush collections</span>
              </div>
            </div>

            {/* Right Action */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end items-start lg:items-end">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Shop Gifting Guide
                </Button>
              </Link>
              <Link href="/shop?category=sensory-baby" className="w-full sm:w-auto">
                <Button variant="ghost" size="md" className="w-full sm:w-auto text-stone-300 hover:text-white hover:bg-white/10">
                  Newborn Gift Ideas
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
