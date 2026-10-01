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
      'We use exclusively food-grade plant oils, water-based non-toxic stains, and pure beeswax. Exceeds ASTM F963 and European EN71 toy safety certifications.',
    color: 'text-[#E76F51]',
    bg: 'bg-[#FFF2EE]',
    badge: 'Zero Lead & Heavy Metals',
  },
  {
    icon: Sparkles,
    title: 'Open-Ended Montessori Play',
    subtitle: 'Nurtures curiosity without screens',
    description:
      'Designed to foster independent problem solving, spatial intuition, and emotional resilience. Toys that grow with your child rather than dictating how to play.',
    color: 'text-[#E9C46A]',
    bg: 'bg-amber-50',
    badge: 'Doctor & Educator Approved',
  },
  {
    icon: Leaf,
    title: 'FSC Hardwoods & Pure Linen',
    subtitle: 'Heirloom craft, earth-conscious legacy',
    description:
      'Harvested from certified sustainable European forests. No cheap particle boards, synthetic fragrances, or plastic wrapping anywhere in our fulfillment chain.',
    color: 'text-[#2A9D8F]',
    bg: 'bg-emerald-50',
    badge: '100% Plastic-Free Packaging',
  },
  {
    icon: HeartHandshake,
    title: '100-Day Playroom Guarantee',
    subtitle: 'Real peace of mind for parents',
    description:
      'Children need time to bond with toys. Let them explore for 100 days. If a piece does not spark joy and wonder in your home, return or exchange it effortlessly.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    badge: 'Free Exchanges Guaranteed',
  },
];

export function WhyJustBorn() {
  return (
    <section className="py-20 bg-[#FDFBF7] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D65A3B] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Uncompromising Standards</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Why Parents & Little Dreamers Love Just Born
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
            In a world inundated with noisy disposable plastics, we craft quiet, sensory-rich treasures
            that stand the test of time, messy toddler hands, and generational hand-me-downs.
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
                className="rounded-3xl bg-white border border-stone-200/80 p-6 flex flex-col justify-between warm-shadow hover:shadow-xl transition-all"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${pillar.bg} ${pillar.color} flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-extrabold text-stone-500 tracking-wider uppercase block mb-1">
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

                <div className="pt-5 mt-5 border-t border-stone-100 flex items-center gap-1.5 text-xs font-bold text-stone-700">
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
