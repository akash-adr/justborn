'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Star, Award } from 'lucide-react';
import { Button } from '../ui/Button';
import { JustBornLogo } from './JustBornLogo';
import { initJustBornHeroAnimation } from '@/lib/animations/justBornHero';

export function JustBornHero() {
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const logoSvgRef = useRef<SVGSVGElement>(null);
  const letterRefs = useRef<(SVGElement | null)[]>([]);
  const blockRefs = useRef<(SVGElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Initialize full GSAP timeline, parallax, and scroll interactions
    const cleanup = initJustBornHeroAnimation({
      heroContainer: heroContainerRef.current,
      logoWrapper: logoSvgRef.current,
      letters: letterRefs.current,
      blocks: blockRefs.current,
      textElements: textRefs.current,
    });

    return () => {
      cleanup();
    };
  }, []);

  return (
    <section
      ref={heroContainerRef}
      className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#FAF8F5] select-none"
      style={{ opacity: 0 }} // Controlled smoothly by GSAP
    >
      {/* ---------------- 1. STOREFRONT TOP ARCHITECTURAL RED FASCIA ---------------- */}
      <div className="w-full bg-[#D9232E] border-b border-[#B91C26] shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-white text-xs sm:text-sm font-bold tracking-wide">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="uppercase tracking-wider">India&apos;s Premium Handcrafted Toy Brand</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs text-red-100 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-white" /> BIS & ASTM Certified Safe
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-white" /> 100% Non-Toxic Organic Dyes
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/90">
            <span>Free Delivery Over ₹999</span>
          </div>
        </div>
        {/* Subtle architectural panel seam line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* ---------------- 2. ARCHITECTURAL SIGNBOARD BACKGROUND ---------------- */}
      {/* Subtle vertical architectural ACP cladding seams (from physical store sign) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,35,46,0.06),rgba(255,255,255,0))]" />
        
        {/* Architectural vertical panel joints */}
        <div className="max-w-7xl mx-auto h-full grid grid-cols-6 lg:grid-cols-12 opacity-40">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="border-r border-stone-200/50 h-full first:border-l"
            />
          ))}
        </div>

        {/* Ambient warm lighting & subtle soft glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[70vw] h-[350px] bg-white/70 rounded-full blur-3xl" />
        <div className="absolute top-12 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-red-100/25 rounded-full blur-3xl" />
      </div>

      {/* ---------------- 3. MAIN HERO CONTENT AREA (CENTER STAGE LOGO) ---------------- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col items-center justify-center pt-8 pb-12 lg:pt-12 lg:pb-16 text-center">
        
        {/* Pill Tagline Badge */}
        <div
          ref={(el) => {
            textRefs.current[0] = el;
          }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-xs border border-red-200/80 text-[#D9232E] text-xs sm:text-sm font-extrabold mb-6 tracking-wide"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D9232E]" />
          <span>EST. PREMIUM TOY STORE • CHERISHED BY 10,000+ FAMILIES</span>
        </div>

        {/* ---------------- THE RECREATED PHYSICAL JUST BORN LOGO (DOMINANT VISUAL) ---------------- */}
        <div className="w-full max-w-[92vw] sm:max-w-[88vw] lg:max-w-[82vw] xl:max-w-[1280px] my-2 sm:my-4 transition-transform duration-300">
          <JustBornLogo
            svgRef={logoSvgRef}
            onSetLetterRef={(idx, el) => {
              letterRefs.current[idx] = el;
            }}
            onSetBlockRef={(idx, el) => {
              blockRefs.current[idx] = el;
            }}
            className="w-full"
          />
        </div>

        {/* Headline / Subtitle Under Logo */}
        <div
          ref={(el) => {
            textRefs.current[1] = el;
          }}
          className="mt-6 sm:mt-8 max-w-2xl px-4"
        >
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-stone-800 tracking-tight leading-snug">
            Heirloom Wooden Toys & Sensory Montessori Wonders
          </p>
          <p className="text-sm sm:text-base text-stone-600 mt-2 font-medium leading-relaxed">
            Crafted with certified non-toxic organic beechwood, smooth tactile finishes, and vibrant safe dyes to spark boundless childhood curiosity without screens.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div
          ref={(el) => {
            textRefs.current[2] = el;
          }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 px-4"
        >
          <Link href="/shop">
            <Button
              size="lg"
              className="bg-[#D9232E] hover:bg-[#BF1620] text-white px-8 py-4 rounded-2xl shadow-lg shadow-red-600/20 text-base font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Explore Collections
            </Button>
          </Link>
          <Link href="/shop?category=wooden-montessori">
            <Button
              variant="outline"
              size="lg"
              className="bg-white/90 backdrop-blur-md border-2 border-stone-200 hover:border-[#D9232E] hover:text-[#D9232E] text-stone-800 px-7 py-4 rounded-2xl text-base font-bold shadow-xs transition-all cursor-pointer"
            >
              Montessori Wood Toys
            </Button>
          </Link>
        </div>

        {/* Trust Badges */}
        <div
          ref={(el) => {
            textRefs.current[3] = el;
          }}
          className="mt-10 sm:mt-12 pt-6 border-t border-stone-200/70 w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center"
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-stone-900 font-black text-xl sm:text-2xl">
              <span>100%</span>
            </div>
            <span className="text-xs text-stone-500 font-semibold mt-0.5">Non-Toxic Dyes</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-stone-900 font-black text-xl sm:text-2xl">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.9 / 5</span>
            </div>
            <span className="text-xs text-stone-500 font-semibold mt-0.5">Parent Reviews</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-stone-900 font-black text-xl sm:text-2xl">
              <span>100-Day</span>
            </div>
            <span className="text-xs text-stone-500 font-semibold mt-0.5">Play Guarantee</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-stone-900 font-black text-xl sm:text-2xl">
              <ShieldCheck className="w-4 h-4 text-[#05A852]" />
              <span>BIS Certified</span>
            </div>
            <span className="text-xs text-stone-500 font-semibold mt-0.5">Govt Tested Safe</span>
          </div>
        </div>

      </div>

      {/* ---------------- 4. STOREFRONT BOTTOM RED ACCENT BAND ---------------- */}
      <div className="w-full bg-[#D9232E] h-2.5 sm:h-3 border-t border-[#B91C26] relative z-20" />
    </section>
  );
}
