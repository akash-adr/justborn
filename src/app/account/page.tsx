'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/services/authService';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  User,
  MapPin,
  Package,
  Heart,
  LogOut,
  Sparkles,
  Baby,
  Edit2,
  CheckCircle,
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Phone,
  Mail,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, isAdmin, signOut, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [childStage, setChildStage] = useState('Toddler Explorer (1-2 years)');
  const [saving, setSaving] = useState(false);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.fullName || '');
      setPhone(profile.phone || '');
      if (profile.childrenAges && profile.childrenAges.length > 0) {
        setChildStage(profile.childrenAges[0]);
      }
    }
  }, [profile]);

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [user, authLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await authService.updateProfile({
        fullName: name.trim(),
        phone: phone.trim(),
        childrenAges: [childStage],
      });
      await refreshProfile();
      setEditing(false);
      showToast({
        type: 'success',
        title: 'Profile Updated! ✨',
        message: 'Your parent account details have been securely saved.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Could not save profile details.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have been safely signed out of Just Born.',
      });
      router.push('/login');
    } catch {
      showToast({
        type: 'error',
        title: 'Sign Out Error',
        message: 'Could not complete sign out.',
      });
    }
  };

  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-3 border-[#E63946] border-t-transparent rounded-full mb-3"
        />
        <p className="text-xs font-semibold text-stone-500">Loading your playroom account...</p>
      </div>
    );
  }

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Valued Parent';
  const displayEmail = user?.email || profile?.email || '';

  return (
    <div className="min-h-screen py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Access Banner (if user is admin) */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-3xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#E63946] border border-red-200 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Workshop Admin Access Granted</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E63946] text-white">
                    Admin
                  </span>
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  You have administrative privileges to manage products, view system orders, and adjust catalog inventory.
                </p>
              </div>
            </div>
            <Link href="/admin">
              <Button
                size="sm"
                className="bg-[#E63946] hover:bg-[#D62828] text-white shrink-0"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Workshop Admin
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E63946] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> Just Born Family Member
              </span>
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">
              Parent Playroom Account
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Manage your delivery addresses, developmental milestones, and order history.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/orders">
              <Button variant="outline" size="sm" leftIcon={<Package className="w-4 h-4" />}>
                Orders
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Heart className="w-4 h-4 text-rose-500" />}
              >
                Wishlist
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-stone-600 hover:text-red-600 hover:bg-red-50"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-red-50 border-2 border-red-200 text-[#E63946] font-black text-2xl flex items-center justify-center shrink-0 shadow-xs">
                {profile?.fullName ? (
                  profile.fullName.charAt(0).toUpperCase()
                ) : (
                  <User className="w-8 h-8 text-[#E63946]" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-stone-900 truncate">{displayName}</h3>
                <p className="text-xs text-stone-500 truncate flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{displayEmail}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Active Session
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] font-black uppercase text-[#E63946] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Editing Form or Info View */}
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.form
                  key="edit-form"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  onSubmit={handleSave}
                  className="space-y-4 pt-4 border-t border-stone-100"
                >
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Parent's Name"
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    leftIcon={<Phone className="w-4 h-4 text-stone-400" />}
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">
                      Child&apos;s Playroom Stage
                    </label>
                    <select
                      value={childStage}
                      onChange={(e) => setChildStage(e.target.value)}
                      className="w-full text-xs font-medium rounded-2xl bg-white border border-stone-200 px-3.5 py-2.5 text-stone-800 focus:outline-none focus:border-[#E63946]"
                    >
                      <option value="Expecting / Newborn (0-6m)">Expecting / Newborn (0-6m)</option>
                      <option value="Sitting & Crawling (6-12m)">Sitting & Crawling (6-12m)</option>
                      <option value="Toddler Explorer (1-2 years)">Toddler Explorer (1-2 years)</option>
                      <option value="Imaginative Creator (3-4 years)">Imaginative Creator (3-4 years)</option>
                      <option value="School Age Thinker (5+ years)">School Age Thinker (5+ years)</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={saving}
                      disabled={saving}
                      className="bg-[#E63946] hover:bg-[#D62828] text-white"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="info-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3 pt-4 border-t border-stone-100 text-xs"
                >
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone:
                    </span>
                    <span className="font-semibold text-stone-800">
                      {profile?.phone || 'None provided'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Baby className="w-3.5 h-3.5" /> Stage:
                    </span>
                    <span className="font-semibold text-stone-800">
                      {profile?.childrenAges?.[0] || 'Toddler Explorer (1-2 years)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Joined:
                    </span>
                    <span className="font-semibold text-stone-800">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                  </div>

                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:underline pt-3 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile Details</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stage Guidance Note */}
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs mb-1">
                <Baby className="w-4 h-4 text-[#E63946]" />
                <span>Playroom Milestones</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                We calibrate your milestone toys and developmental recommendations automatically based on your child&apos;s stage.
              </p>
            </div>
          </div>

          {/* Right Column: Delivery Addresses & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-[#E63946] flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">Saved Playroom Addresses</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {profile?.savedAddresses && profile.savedAddresses.length > 0 ? (
                  profile.savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border text-xs flex flex-col justify-between ${
                        addr.isDefault
                          ? 'border-[#E63946]/40 bg-red-50/30'
                          : 'border-stone-200 bg-stone-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-stone-900">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold text-[#E63946] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-stone-800">{addr.fullName}</p>
                        <p className="text-stone-500 mt-1">{addr.street}</p>
                        <p className="text-stone-500">
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs">
                    <span className="font-bold text-stone-900 block mb-1">Primary Residence</span>
                    <p className="font-semibold text-stone-800">{displayName}</p>
                    <p className="text-stone-500 mt-1">104, Lotus Enclave, Linking Road, Bandra West</p>
                    <p className="text-stone-500">Mumbai, Maharashtra 400050</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Gifting Help Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-stone-900">Explore Heirloom Toys</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Browse wooden Montessori puzzles, sensory organic plush, and hand-finished treasures.
                </p>
              </div>
              <Link href="/shop">
                <Button size="sm" className="bg-[#E63946] hover:bg-[#D62828] text-white">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
