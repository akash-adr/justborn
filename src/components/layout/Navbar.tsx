'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS, CATEGORIES } from '@/lib/mock-data';
import { formatPrice } from '@/lib/utils';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setCartDrawerOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, profile, isAdmin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter products for search modal
  const filteredProducts = searchQuery.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#D9232E] text-white text-xs py-2 px-4 font-medium shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="hidden sm:inline">Certified Child-Safe & Non-Toxic:</span>
            <span>Free Express Delivery across India on orders over ₹999 • 100-Day Play Guarantee</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-white/90">
            <Link href="/admin" className="hover:text-amber-200 transition flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
              Admin Demo
            </Link>
            <span className="hidden md:inline text-white/50">|</span>
            <Link href="/orders" className="hover:text-white transition hidden md:inline">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/80 py-3'
            : 'bg-white border-b border-stone-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-xl text-stone-700 hover:bg-stone-100 transition"
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#D9232E] shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 fill-[#D9232E]/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 group-hover:text-[#D9232E] transition-colors leading-none">
                  Just Born
                </span>
                <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase mt-0.5">
                  Playful & Heirloom
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-stone-700">
              <Link
                href="/shop"
                className={`transition hover:text-[#D9232E] ${
                  pathname === '/shop' ? 'text-[#D9232E]' : ''
                }`}
              >
                Shop All
              </Link>
              <Link
                href="/shop?category=wooden-montessori"
                className="transition hover:text-[#D9232E]"
              >
                Wooden & Montessori
              </Link>
              <Link
                href="/shop?category=soft-plush"
                className="transition hover:text-[#D9232E]"
              >
                Soft Plush
              </Link>
              <Link
                href="/shop?category=sensory-baby"
                className="transition hover:text-[#D9232E]"
              >
                Sensory & Baby
              </Link>
              <Link
                href="/shop?filter=new"
                className="transition hover:text-[#D9232E] flex items-center gap-1 text-[#D9232E]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9232E]"></span>
                New Arrivals
              </Link>
              <Link
                href="/shop?filter=bestseller"
                className="transition hover:text-[#D9232E] flex items-center gap-1 text-stone-800"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Best Sellers
              </Link>
            </nav>

            {/* Actions: Search, Wishlist, Account, Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition flex items-center gap-2"
                aria-label="Search toys"
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:inline text-xs font-medium text-stone-400">Search toys...</span>
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative p-2 rounded-full text-stone-600 hover:text-red-600 hover:bg-red-50 transition"
                aria-label="View wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#D9232E] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Admin Quick Link */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-[#D9232E] border border-red-200 text-xs font-bold hover:bg-red-100 transition"
                  title="Admin Dashboard"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Account / Sign In Link */}
              {user ? (
                <Link
                  href="/account"
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition hidden sm:flex items-center gap-2 border border-stone-200"
                  aria-label="Account"
                >
                  <div className="w-6 h-6 rounded-full bg-red-100 text-[#D9232E] text-xs font-bold flex items-center justify-center">
                    {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-semibold max-w-[90px] truncate hidden md:inline">
                    {profile?.fullName ? profile.fullName.split(' ')[0] : 'Account'}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold text-stone-700 hover:text-[#D9232E] hover:bg-stone-100 transition hidden sm:flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative flex items-center gap-2 bg-[#D9232E] text-white hover:bg-[#D62828] px-3.5 sm:px-4 py-2 rounded-full shadow-md shadow-red-500/20 transition active:scale-95 cursor-pointer"
                aria-label="View shopping basket"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="text-xs font-bold hidden sm:inline">Basket</span>
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-5 h-5 rounded-full bg-white text-[#D9232E] text-xs font-black flex items-center justify-center shadow-xs"
                >
                  {itemCount}
                </motion.span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Search Modal */}
      <AnimatePresence>
        {searchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchModalOpen(false)}
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden z-10"
            >
              <div className="p-4 border-b border-stone-100 flex items-center gap-3">
                <Search className="w-5 h-5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, wood, plush, montessori..."
                  className="w-full text-base font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-stone-400 hover:text-stone-700"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setSearchModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results Area */}
              <div className="p-4 max-h-96 overflow-y-auto">
                {searchQuery.trim() === '' ? (
                  <div className="space-y-3 py-2">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Rainbow Stacker', 'Linen Bunny', 'Beeswax Crayons', 'Marble Run', 'Montessori'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="text-xs font-medium px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-[#FFF2EE] hover:text-[#D65A3B] transition"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                      Matching Toys ({filteredProducts.length})
                    </p>
                    {filteredProducts.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.slug}`}
                        onClick={() => setSearchModalOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-2xl hover:bg-stone-50 transition group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#D9232E] transition line-clamp-1">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-1">{prod.category} • Age: {prod.ageGroup}</p>
                        </div>
                        <span className="text-sm font-extrabold text-stone-900">
                          {formatPrice(prod.price)}
                        </span>
                      </Link>
                    ))}
                    <div className="pt-2 text-center border-t border-stone-100 mt-2">
                      <Link
                        href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setSearchModalOpen(false)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#D9232E] hover:underline"
                      >
                        <span>See all search results</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm font-semibold text-stone-700">No toys found for &quot;{searchQuery}&quot;</p>
                    <p className="text-xs text-stone-400 mt-1">Try another keyword or category name.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-5 border-b border-stone-100">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#D9232E]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-black text-stone-900">Just Born</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Links */}
              <div className="py-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Browse Store
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-base font-bold text-stone-800 hover:text-[#D9232E]"
                  >
                    <span>All Toys</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2 text-sm font-semibold text-stone-600 hover:text-[#D9232E]"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-stone-400">{cat.itemCount}</span>
                    </Link>
                  ))}
                </div>

                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Customer Account
                  </p>
                  {user ? (
                    <>
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2 text-sm font-semibold text-stone-700"
                      >
                        <User className="w-4 h-4 text-[#D9232E]" />
                        <span>My Account ({profile?.fullName ? profile.fullName.split(' ')[0] : 'Parent'})</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2 text-sm font-semibold text-stone-700"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Wishlist ({wishlistItems.length})</span>
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2 text-sm font-semibold text-stone-700"
                      >
                        <ShoppingBag className="w-4 h-4 text-teal-600" />
                        <span>Order History</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 py-2 text-sm font-semibold text-[#D9232E] bg-red-50/80 px-2.5 rounded-xl border border-red-200"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-[#D9232E]" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2 text-sm font-bold text-[#D9232E]"
                      >
                        <User className="w-4 h-4 text-[#D9232E]" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 py-2 text-sm font-semibold text-stone-700"
                      >
                        <span>Create Account</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile Footer Info */}
              <div className="mt-auto pt-6 border-t border-stone-100 text-xs text-stone-500">
                <p className="font-semibold text-stone-700">Need gifting guidance?</p>
                <p className="mt-0.5">hello@justborn-toys.com</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
