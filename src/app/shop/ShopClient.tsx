'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Product, Category, PaginatedProducts } from '@/lib/types';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SlidersHorizontal, Search } from 'lucide-react';

interface ShopClientProps {
  initialData: PaginatedProducts;
  categories: Category[];
  searchParams: any;
}

export default function ShopClient({ initialData, categories, searchParams }: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for UI
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.min || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.max || '');
  const [search, setSearch] = useState(searchParams.search || '');

  const activeCategory = searchParams.category || 'all';
  const activeAge = searchParams.age || 'all';
  const activeSort = searchParams.sortBy || 'featured';
  const inStockOnly = searchParams.inStock === 'true';

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(sp.toString());
    params.set('page', '1'); // Reset to page 1 on filter change
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set('page', newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Price preset logic
  const handlePricePreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateFilters({ min, max });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const categoriesList = [
    { label: 'All Collections', value: 'all' },
    ...categories.map(c => ({ label: c.name, value: c.slug }))
  ];

  const ageGroups = [
    { label: 'All Ages', value: 'all' },
    { label: '0-12 Months', value: '0-12m' },
    { label: '1-2 Years', value: '1-2y' },
    { label: '3-4 Years', value: '3-4y' },
    { label: '5+ Years', value: '5y+' },
  ];

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 mb-3 tracking-tight">The Heirloom Toy Room</h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Discover toys designed for open-ended play and developmental milestones.
            </p>
          </div>
          <form onSubmit={handleSearch} className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="Search toys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-stone-200/80 rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all shadow-sm"
            />
          </form>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-stone-100 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer select-none bg-stone-50 px-3 py-2 rounded-2xl border border-stone-200/80 hover:bg-stone-100 transition">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : null })}
                  className="rounded text-[#E63946] focus:ring-[#E63946]/30 w-4 h-4 accent-[#E63946]"
                />
                <span>In Stock Only</span>
              </label>

              <button
                onClick={() => setShowPriceFilter(!showPriceFilter)}
                className={`text-xs font-semibold px-3 py-2 rounded-2xl border transition flex items-center gap-1.5 cursor-pointer ${
                  showPriceFilter || minPrice || maxPrice
                    ? 'bg-red-50 text-[#E63946] border-red-200'
                    : 'bg-stone-50 text-stone-700 border-stone-200/80 hover:bg-stone-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Price</span>
                {(minPrice || maxPrice) && <span className="w-2 h-2 rounded-full bg-[#E63946]" />}
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={activeSort}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  className="text-xs font-semibold rounded-2xl bg-stone-50 border border-stone-200 px-3 py-2 text-stone-800 focus:outline-none focus:border-[#E63946]"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          {showPriceFilter && (
            <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Price Range (₹)</span>
                <button
                  onClick={() => handlePricePreset('', '')}
                  className="text-[11px] font-semibold text-[#E63946] hover:underline"
                >
                  Clear Price
                </button>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={() => updateFilters({ min: minPrice })}
                  className="w-24 text-xs font-semibold px-3 py-2 border rounded-xl"
                />
                <span className="text-stone-400 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={() => updateFilters({ max: maxPrice })}
                  className="w-24 text-xs font-semibold px-3 py-2 border rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
            {categoriesList.map((cat) => (
              <button
                key={cat.value}
                onClick={() => updateFilters({ category: cat.value })}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeCategory === cat.value
                    ? 'bg-[#E63946] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-[#E63946]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-400 mr-1">Age:</span>
            {ageGroups.map((age) => (
              <button
                key={age.value}
                onClick={() => updateFilters({ age: age.value })}
                className={`text-xs font-semibold px-3 py-1 rounded-xl transition cursor-pointer ${
                  activeAge === age.value
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Showing {initialData.total} {initialData.total === 1 ? 'Toy' : 'Toys'}
          </p>
        </div>

        <div className={`transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          <ProductGrid
            products={initialData.products}
            isLoading={false}
            emptyTitle="No toys match this criteria"
            emptyDescription="Try clearing your filters."
            onResetFilters={() => router.push(pathname)}
          />

          {/* Pagination Controls */}
          {initialData.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                disabled={initialData.page <= 1 || isPending}
                onClick={() => handlePageChange(initialData.page - 1)}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-white border border-stone-200 text-stone-700 disabled:opacity-50 hover:bg-stone-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: initialData.totalPages }).map((_, i) => (
                  <button
                    key={i}
                    disabled={isPending}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      initialData.page === i + 1
                        ? 'bg-[#E63946] text-white'
                        : 'bg-transparent text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={!initialData.hasMore || isPending}
                onClick={() => handlePageChange(initialData.page + 1)}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-white border border-stone-200 text-stone-700 disabled:opacity-50 hover:bg-stone-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
