'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';
import { EmptyState } from '../ui/EmptyState';
import { ProductGridSkeleton } from '../ui/LoadingSkeleton';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
}

export function ProductGrid({
  products,
  isLoading = false,
  emptyTitle = 'No toys found',
  emptyDescription = 'Try adjusting your filters or search keywords to explore more wonders.',
  onResetFilters,
}: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        iconType="search"
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onResetFilters ? 'Clear Filters' : 'Browse All Toys'}
        onAction={onResetFilters}
        actionHref={onResetFilters ? undefined : '/shop'}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(p) => setQuickViewProduct(p)}
            priority={idx < 4}
          />
        ))}
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}
