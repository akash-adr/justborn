'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Leaf, HeartHandshake, CheckCircle2 } from 'lucide-react';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Certified 100% Non-Toxic',
    subtitle: 'Safe for toddler mouthing & teething',
    description:
      'We use exclusively food-grade organic oils, water-based vegetable stains, and natural beeswax. Conforms to Indian BIS (IS 9873) and ASTM F963 safety mandates.',
    color: 'text-[#E63946]',
    bg: 'bg-red-50',
    badge: 'Zero Lead & Heavy Metals',
  },
  {
    icon: Sparkles,
    title: 'Open-Ended Montessori Play',
    subtitle: 'Nurtures curiosity without screens',
    description:
      'Designed to cultivate independent problem solving, spatial balance, and fine motor grip. Toys that grow with your child rather than dictating how to play.',
    color: 'text-[#E63946]',
    bg: 'bg-red-50',
    badge: 'Pediatrician Recommended',
  },
  {
    icon: Leaf,
    title: 'FSC Hardwoods & Pure Linen',
    subtitle: 'Heirloom craft, earth-conscious legacy',
    description:
      'Crafted from sustainable beech and linden hardwoods with pure organic flax linen. No cheap particle boards, synthetic fragrances, or plastic wrapping.',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    badge: '100% Plastic-Free Dispatch',
  },
  {
    icon: HeartHandshake,
    title: '100-Day Playroom Guarantee',
    subtitle: 'True peace of mind for parents',
    description:
      'Children need unhurried time to bond with toys. Explore for 100 days across India. If a piece does not spark deep joy, exchange it effortlessly.',
    color: 'text-[#E63946]',
    bg: 'bg-red-50',
    badge: 'Free Exchanges Guaranteed',
  },
];

export function WhyJustBorn() {
  return (
    <section className="py-20 bg-white border-t border-stone-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Uncompromising Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Why Parents & Little Dreamers Love Just Born
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            In a market overwhelmed with flashing plastic gadgets, we craft quiet, sensory-rich treasures
            that endure toddler curiosity and joyful hand-me-downs.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="rounded-3xl bg-white border border-stone-200/90 p-6 flex flex-col justify-between shadow-xs hover:border-red-200 hover:shadow-lg transition-all"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${pillar.bg} ${pillar.color} flex items-center justify-center mb-5 border border-stone-100`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-extrabold text-[#E63946] tracking-wider uppercase block mb-1">
                    {pillar.badge}
                  </span>

                  <h3 className="text-lg font-bold text-stone-900">
                    {pillar.title}
                  </h3>

                  <p className="text-xs font-semibold text-stone-500 mt-0.5 mb-3">
                    {pillar.subtitle}
                  </p>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-stone-100 flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Quality Verified</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
