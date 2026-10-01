'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, Mail, Lock, User, ArrowRight, Gift } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [childAge, setChildAge] = useState('18 months');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(fullName, email);
      showToast({
        type: 'success',
        title: 'Account Created! 🎈',
        message: 'Welcome to the Just Born playroom circle.',
      });
      router.push('/account');
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Registration failed',
        message: 'Could not create account at this time.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 border border-stone-200/80 shadow-xl warm-shadow-lg">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2EE] border border-[#FED3C7] text-[#E76F51] flex items-center justify-center mx-auto mb-4">
            <Gift className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Join Just Born
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Unlock your $15 welcome credit and bespoke developmental play recommendations.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">
              Child&apos;s Age / Stage (Optional)
            </label>
            <select
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              className="w-full text-xs font-semibold rounded-2xl bg-stone-50 border border-stone-200 px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-[#E76F51]"
            >
              <option value="Expecting / Newborn">Expecting / Newborn (0-6m)</option>
              <option value="Crawling / Babbling">Sitting & Crawling (6-12m)</option>
              <option value="1-2 years">Toddler Explorer (1-2 years)</option>
              <option value="3-4 years">Imaginative Creator (3-4 years)</option>
              <option value="5+ years">School Age Thinker (5+ years)</option>
            </select>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create My Account
          </Button>
        </form>

        {/* Switch to Login */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          <span>Already have an account? </span>
          <Link href="/login" className="font-bold text-[#E76F51] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
