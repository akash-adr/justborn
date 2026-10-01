'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ProductBadge, AgeGroup } from '@/lib/types';
import { Sparkles, Leaf, Award, Flame, Tag } from 'lucide-react';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'bestseller' | 'new' | 'eco' | 'heirloom' | 'sale' | 'montessori' | 'age';
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', className, size = 'sm' }: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 tracking-tight font-semibold',
    md: 'text-xs px-3 py-1 font-semibold',
  };

  const variantStyles = {
    default: 'bg-stone-100 text-stone-700 border border-stone-200/60',
    bestseller: 'bg-amber-100/90 text-amber-900 border border-amber-200/80 font-bold',
    new: 'bg-indigo-100/80 text-indigo-900 border border-indigo-200/70',
    eco: 'bg-emerald-100/80 text-emerald-900 border border-emerald-200/70',
    heirloom: 'bg-orange-100/80 text-orange-900 border border-orange-200/80',
    sale: 'bg-rose-100 text-rose-800 border border-rose-200',
    montessori: 'bg-teal-100/80 text-teal-900 border border-teal-200/70',
    age: 'bg-stone-100 text-stone-600 border border-stone-200/60 font-mono tracking-tight',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ProductBadgeTag({ badge }: { badge: ProductBadge }) {
  switch (badge) {
    case 'Bestseller':
      return (
        <Badge variant="bestseller">
          <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
          Bestseller
        </Badge>
      );
    case 'New':
      return (
        <Badge variant="new">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          New Arrival
        </Badge>
      );
    case 'Eco-Friendly':
      return (
        <Badge variant="eco">
          <Leaf className="w-3 h-3 text-emerald-600" />
          Eco Wood
        </Badge>
      );
    case 'Heirloom':
      return (
        <Badge variant="heirloom">
          <Award className="w-3 h-3 text-orange-600" />
          Heirloom
        </Badge>
      );
    case 'Sale':
      return (
        <Badge variant="sale">
          <Tag className="w-3 h-3 text-rose-500" />
          Sale
        </Badge>
      );
    case 'Montessori':
      return (
        <Badge variant="montessori">
          <Sparkles className="w-3 h-3 text-teal-600" />
          Montessori
        </Badge>
      );
    default:
      return <Badge>{badge}</Badge>;
  }
}

export function AgeBadge({ age }: { age: AgeGroup | string }) {
  return (
    <span className="inline-flex items-center text-[11px] font-bold tracking-tight text-stone-600 bg-stone-100/80 px-2 py-0.5 rounded-md border border-stone-200/50">
      Age: {age}
    </span>
  );
}
