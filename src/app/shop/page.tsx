'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, AgeGroup } from '@/lib/types';
import { productService } from '@/lib/services/productService';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  SlidersHorizontal,
  X,
  Filter,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialFilter = searchParams.get('filter') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync with searchParams changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);

    const filt = searchParams.get('filter');
    if (filt === 'new') setSortBy('newest');
    if (filt === 'bestseller') setSortBy('rating');

    const search = searchParams.get('search');
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const categories = [
    { label: 'All Collections', value: 'all' },
    { label: 'Wooden & Montessori', value: 'wooden-montessori' },
    { label: 'Soft & Snuggle Plush', value: 'soft-plush' },
    { label: 'Sensory & Baby', value: 'sensory-baby' },
    { label: 'Creative & Crafts', value: 'creative-arts' },
    { label: 'Puzzles & Brain Play', value: 'puzzles-games' },
    { label: 'Pretend & Discovery', value: 'pretend-play' },
  ];

  const ageGroups: { label: string; value: string }[] = [
    { label: 'All Ages', value: 'all' },
    { label: '0–12m', value: '0-12m' },
    { label: '1–2 years', value: '1-2y' },
    { label: '3–4 years', value: '3-4y' },
    { label: '5–7 years', value: '5-7y' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) {
        return false;
      }
      // Age filter
      if (selectedAge !== 'all' && p.ageGroup !== selectedAge) {
        return false;
      }
      // In stock
      if (inStockOnly && !p.inStock) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesMaterial = p.materials.some((m) => m.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesMaterial) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedAge, inStockOnly, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedAge('all');
    setSortBy('featured');
    setSearchQuery('');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedAge !== 'all' ||
    searchQuery.trim() !== '' ||
    inStockOnly;

  return (
    <div className="min-h-screen py-10 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Breadcrumbs */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#E76F51]">Shop Collections</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            The Heirloom Toy Room
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-xl">
            Explore pure hardwoods, natural beeswax finishes, and open-ended developmental toys crafted for curiosity.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="w-full md:max-w-md">
              <Input
                placeholder="Search toys by material, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                rightIcon={
                  searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-stone-400 hover:text-stone-700 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null
                }
              />
            </div>

            {/* Sort & Quick Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-[#E76F51] focus:ring-[#E76F51]/30 w-4 h-4 accent-[#E76F51]"
                />
                <span>In Stock Only</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold rounded-2xl bg-stone-50 border border-stone-200 px-3 py-2 text-stone-800 focus:outline-none focus:border-[#E76F51]"
                >
                  <option value="featured">Featured First</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-[#E76F51] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Age Group Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold text-stone-400 mr-1">Age:</span>
            {ageGroups.map((age) => (
              <button
                key={age.value}
                onClick={() => setSelectedAge(age.value)}
                className={`text-xs font-medium px-3 py-1 rounded-xl transition ${
                  selectedAge === age.value
                    ? 'bg-[#26221F] text-white font-bold'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                }`}
              >
                {age.label}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto text-xs font-bold text-[#E76F51] hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Toy' : 'Toys'}
          </p>
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={filteredProducts}
          isLoading={loading}
          emptyTitle="No toys match this criteria"
          emptyDescription="Try clearing your category or age filters to see our full inventory of heirloom play pieces."
          onResetFilters={resetFilters}
        />
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-12 text-center text-stone-400">Loading collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
