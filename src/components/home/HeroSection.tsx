'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Star, Award } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-6 pb-16 lg:py-20 bg-gradient-to-b from-[#FDFBF7] via-[#FFF9F2] to-[#FDFBF7]">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#FED3C7]/30 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-32 right-10 w-80 h-80 bg-[#E9C46A]/20 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] border border-[#FED3C7] text-[#D65A3B] text-xs font-bold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#E76F51]" />
              <span>Timeless Play • Non-Toxic • Pediatrician Approved</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.12]">
              Play crafted for{' '}
              <span className="relative inline-block text-[#E76F51]">
                wonder,
                <svg
                  className="absolute -bottom-2 left-0 w-full text-[#FED3C7]"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  height="10"
                >
                  <path
                    d="M0 10 Q 50 20, 100 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              built for generations.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-stone-600 mt-6 max-w-xl leading-relaxed">
              Heirloom wooden toys, soothing organic linen plushies, and Montessori sensory
              wonders that spark boundless childhood imagination without the over-stimulating screens.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/shop">
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Collections
                </Button>
              </Link>
              <Link href="/shop?category=wooden-montessori">
                <Button variant="outline" size="lg">
                  Montessori Wood
                </Button>
              </Link>
            </div>

            {/* Trust Mini Features */}
            <div className="mt-12 pt-8 border-t border-stone-200/70 grid grid-cols-3 gap-6 w-full max-w-lg">
              <div>
                <p className="text-xl sm:text-2xl font-black text-stone-900">100%</p>
                <p className="text-xs text-stone-500 font-semibold mt-0.5">Non-Toxic Dyes</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-stone-900">4.9/5</p>
                <p className="text-xs text-stone-500 font-semibold mt-0.5">Parent Reviews</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-stone-900">100-Day</p>
                <p className="text-xs text-stone-500 font-semibold mt-0.5">Play Guarantee</p>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            {/* Main Showcase Image Card */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-stone-100 shadow-2xl border-4 border-white warm-shadow-lg aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=85"
                alt="Nordic wooden arch stacker in a sunlit playroom"
                className="w-full h-full object-cover"
              />

              {/* Floating Overlay Badge (Top Left) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-5 left-5 rounded-2xl bg-white/95 backdrop-blur-md p-3 shadow-lg border border-stone-100 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-stone-900">Heirloom Quality</p>
                  <p className="text-[11px] text-stone-500">Solid European Beechwood</p>
                </div>
              </motion.div>

              {/* Floating Overlay Badge (Bottom Right) */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-6 right-6 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-xl border border-stone-100 max-w-[210px]"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-bold text-stone-900">“Keeps my 2yo curious for hours!”</p>
                <p className="text-[10px] text-stone-500 mt-0.5">— Verified Parent in Portland</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
