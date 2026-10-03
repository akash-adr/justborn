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
  Gift,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Baby,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const safeRedirect = getSafeRedirectUrl(rawRedirect, '/account');
  const isFromCheckout = safeRedirect.startsWith('/checkout');

  const { signUp } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [childAge, setChildAge] = useState('Toddler Explorer (1-2 years)');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);

  // Field touched tracking
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const isNameValid = fullName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Run strict client-side validation
    if (!isNameValid) {
      setError('Please provide your full name (at least 2 characters).');
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!doPasswordsMatch) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        childAge,
      });

      if (result.needsEmailConfirmation) {
        setVerificationPending(true);
        showToast({
          type: 'info',
          title: 'Verification Email Sent ✉️',
          message: 'Please check your inbox to confirm your playroom account.',
        });
      } else {
        showToast({
          type: 'success',
          title: 'Welcome to Just Born! 🎈',
          message: 'Your parent account has been successfully created.',
        });
        setTimeout(() => {
          if (result.isAdmin) {
            router.push('/admin');
          } else {
            router.push(safeRedirect);
          }
        }, 800);
      }
    } catch (err: any) {
      const msg = err?.message || 'Could not complete registration. Please try again.';
      setError(msg);
      showToast({
        type: 'error',
        title: 'Registration Error',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  // If Supabase requires email verification, show clean confirmation card
  if (verificationPending) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 border border-stone-200 shadow-xl shadow-red-500/5 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-[#E63946] to-rose-400" />
        <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 text-[#E63946] flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight">Check Your Inbox</h2>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          We&apos;ve sent a verification link to <strong className="text-stone-900">{email}</strong>.
          Click the link in the email to activate your account and start shopping heirloom play essentials.
        </p>

        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col gap-3">
          <Link href="/login">
            <Button size="lg" className="w-full bg-[#E63946] hover:bg-[#D62828] text-white">
              Back to Sign In
            </Button>
          </Link>
          <button
            onClick={() => setVerificationPending(false)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
          >
            Entered the wrong email? Try again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 border border-stone-200 shadow-xl shadow-red-500/5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 via-[#E63946] to-rose-400" />

      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-[#E63946] flex items-center justify-center mx-auto mb-4 shadow-sm"
        >
          <Gift className="w-7 h-7 fill-[#E63946]/10" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Join Just Born
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
          Create an account to unlock ₹500 welcome credit and tailored developmental milestone picks.
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
              Create an account to continue to checkout
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Your playroom basket is preserved and will be restored immediately after registration.
            </p>
          </div>
        </div>
      )}

      {/* Error alert */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. Priya Sharma"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (error) setError(null);
            }}
            onBlur={() => setTouched({ ...touched, fullName: true })}
            leftIcon={<User className="w-4 h-4 text-stone-400" />}
            required
            autoComplete="name"
            disabled={loading}
          />
          {touched.fullName && fullName && !isNameValid && (
            <p className="text-[11px] text-red-600 mt-1 font-medium">
              Please enter your full name (min 2 characters).
            </p>
          )}
        </div>

        <div>
          <Input
            label="Email Address"
            type="email"
            placeholder="priya@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            onBlur={() => setTouched({ ...touched, email: true })}
            leftIcon={<Mail className="w-4 h-4 text-stone-400" />}
            required
            autoComplete="email"
            disabled={loading}
          />
          {touched.email && email && !isEmailValid && (
            <p className="text-[11px] text-red-600 mt-1 font-medium">
              Please provide a valid email address.
            </p>
          )}
        </div>

        <div>
          <Input
            label="Create Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
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
            autoComplete="new-password"
            disabled={loading}
          />
          {touched.password && password && !isPasswordValid && (
            <p className="text-[11px] text-red-600 mt-1 font-medium">
              Password must be at least 6 characters.
            </p>
          )}
        </div>

        <div>
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null);
            }}
            onBlur={() => setTouched({ ...touched, confirmPassword: true })}
            leftIcon={<Lock className="w-4 h-4 text-stone-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-stone-400 hover:text-stone-600 focus:outline-none transition p-1"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
            autoComplete="new-password"
            disabled={loading}
          />
          {touched.confirmPassword && confirmPassword && !doPasswordsMatch && (
            <p className="text-[11px] text-red-600 mt-1 font-medium">Passwords do not match.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
            <Baby className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Child&apos;s Playroom Stage (Optional)</span>
          </label>
          <select
            value={childAge}
            onChange={(e) => setChildAge(e.target.value)}
            disabled={loading}
            className="w-full text-xs font-medium rounded-2xl bg-white border border-stone-200 px-3.5 py-2.5 text-stone-800 focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-red-100 transition shadow-xs"
          >
            <option value="Expecting / Newborn (0-6 months)">
              Expecting / Newborn (0-6 months)
            </option>
            <option value="Sitting & Crawling (6-12 months)">
              Sitting & Crawling (6-12 months)
            </option>
            <option value="Toddler Explorer (1-2 years)">Toddler Explorer (1-2 years)</option>
            <option value="Imaginative Creator (3-4 years)">
              Imaginative Creator (3-4 years)
            </option>
            <option value="School Age Thinker (5+ years)">School Age Thinker (5+ years)</option>
          </select>
        </div>

        <Button
          type="submit"
          size="lg"
          isLoading={loading}
          disabled={loading}
          className="w-full mt-3 bg-[#D9232E] hover:bg-[#BF1620] text-white shadow-md shadow-red-500/20 active:scale-[0.99] transition cursor-pointer"
          rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
        >
          {loading ? 'Creating Account...' : 'Create My Account'}
        </Button>
      </form>

      {/* Security guarantee */}
      <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
        <span>Protected with Supabase Auth & PostgreSQL RLS</span>
      </div>

      {/* Switch to Login */}
      <div className="mt-5 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
        <span>Already have an account? </span>
        <Link
          href={`/login${rawRedirect ? `?redirect=${encodeURIComponent(safeRedirect)}` : ''}`}
          className="font-bold text-[#D9232E] hover:underline ml-1"
        >
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen py-16 bg-white flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 border border-stone-200 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-[#D9232E] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
