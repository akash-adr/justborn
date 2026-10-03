'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getSafeRedirectUrl } from '@/lib/utils';
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const safeRedirect = getSafeRedirectUrl(rawRedirect, '/account');
  const isFromCheckout = safeRedirect.startsWith('/checkout');

  const { signIn } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Field validation states
  const [touched, setTouched] = useState({ email: false, password: false });

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Final validation check
    if (!isEmailValid) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email.trim(), password);

      setSuccess(true);
      showToast({
        type: 'success',
        title: result.isAdmin ? 'Welcome Admin! 🛡️' : 'Welcome Back! 👋',
        message: result.isAdmin
          ? 'Routing to Just Born Workshop Control Center...'
          : 'Signed in to your parent playroom account.',
      });

      // Redirect logic: Admins go to /admin, customers go to safe target or /account
      setTimeout(() => {
        if (result.isAdmin) {
          router.push('/admin');
        } else {
          router.push(safeRedirect);
        }
      }, 700);
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
      showToast({
        type: 'error',
        title: 'Sign In Failed',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 border border-stone-200 shadow-xl shadow-red-500/5 relative overflow-hidden"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-[#E63946] to-rose-400" />

      {/* Brand Header */}
      <div className="text-center mb-8">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-[#E63946] flex items-center justify-center mx-auto mb-4 shadow-sm"
        >
          <Sparkles className="w-7 h-7 fill-[#E63946]/10" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Welcome to Just Born
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
          Sign in to your playroom account to track orders, manage wishlists, and view heirloom collections.
        </p>
      </div>

      {/* Informative Checkout Prompt Banner */}
      {isFromCheckout && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-200/80 flex items-center gap-3.5 text-left">
          <div className="w-9 h-9 rounded-xl bg-white text-[#D9232E] flex items-center justify-center shrink-0 shadow-xs border border-red-100">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-900 leading-tight">
              Sign in to continue to checkout
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Your playroom basket is preserved and ready for address & payment.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="mb-5 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 flex items-start gap-2.5 text-xs text-red-800"
          >
            <AlertCircle className="w-4 h-4 text-[#D9232E] shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Success! Redirecting you now...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Email Address"
            type="email"
            placeholder="parent@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            onBlur={() => setTouched({ ...touched, email: true })}
            leftIcon={<Mail className="w-4 h-4 text-stone-400" />}
            required
            autoComplete="email"
            disabled={loading || success}
          />
          {touched.email && email && !isEmailValid && (
            <p className="text-[11px] text-red-600 mt-1 font-medium">
              Please enter a valid email address.
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => setTouched({ ...touched, password: true })}
              leftIcon={<Lock className="w-4 h-4 text-stone-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-stone-400 hover:text-stone-600 focus:outline-none transition p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
              autoComplete="current-password"
              disabled={loading || success}
            />
          </div>
          {touched.password && password && !isPasswordValid && (
            <p className="text-[11px] text-red-600 mt-1 font-medium">
              Password must be at least 6 characters.
            </p>
          )}

          <div className="flex justify-end pt-1.5">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#D9232E] hover:text-red-700 hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={loading}
          disabled={loading || success}
          className="w-full mt-2 bg-[#D9232E] hover:bg-[#BF1620] text-white shadow-md shadow-red-500/20 active:scale-[0.99] transition cursor-pointer"
          rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
        >
          {loading ? 'Authenticating...' : success ? 'Signed In!' : 'Sign In to Account'}
        </Button>
      </form>

      {/* Security guarantee badge */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
        <span>End-to-end encrypted session with Supabase</span>
      </div>

      {/* Switch to Register */}
      <div className="mt-6 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
        <span>Don&apos;t have a playroom account? </span>
        <Link
          href={`/register${rawRedirect ? `?redirect=${encodeURIComponent(safeRedirect)}` : ''}`}
          className="font-bold text-[#D9232E] hover:underline ml-1"
        >
          Create an account
        </Link>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen py-16 bg-white flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 border border-stone-200 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-[#D9232E] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
