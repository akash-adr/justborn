'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('emily.davenport@example.com');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(email);
      showToast({
        type: 'success',
        title: 'Welcome Back! 👋',
        message: 'Logged into your parent playroom account.',
      });
      router.push('/account');
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Sign In Failed',
        message: 'Please check your credentials.',
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
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Welcome to Just Born
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Sign in to track orders, manage wishlists and developmental preferences.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
            <div className="flex justify-end pt-1">
              <span className="text-[11px] text-[#E76F51] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={loading}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Account
          </Button>
        </form>

        {/* Demo Note */}
        <div className="mt-6 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center">
          <p className="text-[11px] text-stone-500">
            💡 <strong>Demo Mode:</strong> Pre-filled with demo parent account credentials.
          </p>
        </div>

        {/* Switch to Register */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          <span>Don&apos;t have a playroom account? </span>
          <Link href="/register" className="font-bold text-[#E76F51] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
