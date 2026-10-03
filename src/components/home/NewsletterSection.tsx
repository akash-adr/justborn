'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { useToast } from '@/context/ToastContext';
import { Mail, Gift, Sparkles, CheckCircle2 } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    showToast({
      type: 'success',
      title: 'Welcome to the Playroom! 🎁',
      message: 'Your ₹500 gift voucher code JUSTBORN500 has been reserved for your first order.',
    });
  };

  return (
    <section className="py-20 bg-white border-t border-stone-100 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[3rem] bg-gradient-to-br from-red-50/60 via-white to-red-50/40 border border-red-200/80 p-8 sm:p-14 text-center clean-shadow-lg relative overflow-hidden"
        >
          {/* Subtle Ambient Dots */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-3xl bg-white text-[#E63946] flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-200">
              <Gift className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Enjoy ₹500 Off Your First Keepsake Toy
            </h2>

            <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
              Join the Just Born Playroom Circle. We share milestone developmental guides, Montessori ideas,
              and private access to handcrafted limited batches.
            </p>

            {submitted ? (
              <div className="mt-8 p-6 rounded-3xl bg-white border border-emerald-200/80 shadow-sm max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>You&apos;re On The List!</span>
                </div>
                <p className="text-xs text-stone-600">
                  Use coupon code <strong className="text-stone-900 font-mono text-sm">JUSTBORN500</strong> at checkout for ₹500 off.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter parent email address..."
                    className="w-full text-sm rounded-full bg-white border border-stone-200 pl-10 pr-4 py-3 text-stone-900 placeholder:text-stone-400 shadow-xs focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <Button type="submit" size="md" className="shrink-0">
                  Claim ₹500 Gift
                </Button>
              </form>
            )}

            {/* Checklist */}
            <div className="mt-8 pt-6 border-t border-red-100/80 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E63946]" /> Zero spam ever
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E63946]" /> Instant voucher code
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E63946]" /> Unsubscribe anytime
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
