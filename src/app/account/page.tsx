'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/lib/types';
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
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function load() {
      const user = await authService.getCurrentUser();
      if (user) {
        setProfile(user);
        setName(user.fullName);
        setPhone(user.phone || '');
      } else {
        router.push('/login');
      }
    }
    load();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const updated = await authService.updateProfile({
        fullName: name,
        phone,
      });
      setProfile(updated);
      setEditing(false);
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your parent account details were saved.',
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update profile.',
      });
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    showToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out.',
    });
    router.push('/login');
  };

  if (!profile) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E76F51] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-[#FDFBF7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">
              Parent Playroom Account
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Manage your delivery addresses, playroom milestones, and order history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/orders">
              <Button variant="outline" size="sm" leftIcon={<Package className="w-4 h-4" />}>
                Orders
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button variant="outline" size="sm" leftIcon={<Heart className="w-4 h-4 text-rose-500" />}>
                Wishlist
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 border-2 border-[#FED3C7] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">{profile.fullName}</h3>
                <p className="text-xs text-stone-500">{profile.email}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                  <CheckCircle className="w-3 h-3" /> Just Born Club Member
                </span>
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-stone-100">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm" variant="primary">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 pt-4 border-t border-stone-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Phone:</span>
                  <span className="font-semibold text-stone-800">{profile.phone || 'None added'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Children Stages:</span>
                  <span className="font-semibold text-stone-800">
                    {profile.childrenAges?.join(', ') || 'Toddler'}
                  </span>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E76F51] hover:underline pt-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile Information</span>
                </button>
              </div>
            )}

            {/* Stage Guidance Note */}
            <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#FED3C7]/60">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs mb-1">
                <Baby className="w-4 h-4 text-[#E76F51]" />
                <span>Playroom Milestones</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                We adjust your gift and developmental recommendations automatically based on your child&apos;s age curve.
              </p>
            </div>
          </div>

          {/* Right Column: Saved Delivery Addresses */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Saved Delivery Addresses
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {profile.savedAddresses && profile.savedAddresses.length > 0 ? (
                  profile.savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border text-xs flex flex-col justify-between ${
                        addr.isDefault
                          ? 'border-[#E76F51]/40 bg-[#FFF5F2]/40'
                          : 'border-stone-200 bg-stone-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-stone-900">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold text-[#E76F51] bg-[#FFF2EE] px-2 py-0.5 rounded-full border border-[#FED3C7]">
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
                  <p className="text-xs text-stone-400">No saved addresses yet.</p>
                )}
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-stone-900">Need personal toy gifting advice?</h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Our early childhood toy specialists are here to assist with milestone recommendations.
                </p>
              </div>
              <Link href="/shop">
                <Button size="sm" variant="primary">
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
