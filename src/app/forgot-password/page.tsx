'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/lib/services/authService';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEmailValid) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
      showToast({
        type: 'success',
        title: 'Recovery Link Sent 💌',
        message: 'Password reset instructions have been emailed to you.',
      });
    } catch (err: any) {
      const msg = err?.message || 'Could not send recovery email. Please check the address.';
      setError(msg);
      showToast({
        type: 'error',
        title: 'Reset Failed',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 border border-stone-200 shadow-xl shadow-red-500/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-[#E63946] to-rose-400" />

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Check Your Inbox</h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              We&apos;ve sent password reset instructions to{' '}
              <strong className="text-stone-900">{email}</strong>. Follow the link inside to
              safely choose a new password.
            </p>

            <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col gap-3">
              <Link href="/login">
                <Button size="lg" className="w-full bg-[#E63946] hover:bg-[#D62828] text-white">
                  Back to Sign In
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
              >
                Send to a different email address
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-[#E63946] flex items-center justify-center mx-auto mb-4 shadow-sm"
              >
                <KeyRound className="w-7 h-7 fill-[#E63946]/10" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Reset Password
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
                Enter the email associated with your Just Born account, and we will send you a secure link to reset your password.
              </p>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mb-5 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 flex items-start gap-2.5 text-xs text-red-800"
                >
                  <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{error}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  leftIcon={<Mail className="w-4 h-4 text-stone-400" />}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={loading}
                disabled={loading}
                className="w-full mt-2 bg-[#E63946] hover:bg-[#D62828] text-white shadow-md shadow-red-500/20 active:scale-[0.99] transition cursor-pointer"
                rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 pt-6 border-t border-stone-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#E63946] transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
