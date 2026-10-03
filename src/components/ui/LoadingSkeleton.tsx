import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-stone-200/70',
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-stone-200/60 p-3.5 flex flex-col gap-3 warm-shadow">
      <Skeleton className="w-full aspect-square rounded-2xl" />
      <div className="space-y-2 px-1">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-3 w-3/5 rounded-md" />
        <div className="pt-2 flex justify-between items-center">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-48 mb-8 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white rounded-[2.5rem] p-6 sm:p-10 border border-stone-200/80">
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Skeleton className="w-full aspect-square rounded-3xl" />
            <div className="flex gap-3">
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <Skeleton className="w-20 h-20 rounded-2xl" />
              <Skeleton className="w-20 h-20 rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-10 w-3/4 rounded-xl" />
              <Skeleton className="h-5 w-1/2 rounded-md" />
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-lg mt-4" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Skeleton className="h-8 rounded-lg" />
                <Skeleton className="h-8 rounded-lg" />
              </div>
            </div>
            <div className="pt-6 border-t border-stone-100 flex gap-4">
              <Skeleton className="h-12 w-32 rounded-full" />
              <Skeleton className="h-12 flex-1 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

