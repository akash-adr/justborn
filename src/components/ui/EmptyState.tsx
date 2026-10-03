import React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { PackageOpen, Heart, ShoppingBag, Search, Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  iconType?: 'cart' | 'wishlist' | 'search' | 'orders' | 'general';
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  iconType = 'general',
  title,
  description,
  actionLabel,
  actionHref = '/shop',
  onAction,
}: EmptyStateProps) {
  const renderIcon = () => {
    switch (iconType) {
      case 'cart':
        return (
          <div className="w-20 h-20 rounded-3xl bg-red-50 text-[#E63946] flex items-center justify-center border border-red-200/60 shadow-sm">
            <ShoppingBag className="w-10 h-10" />
          </div>
        );
      case 'wishlist':
        return (
          <div className="w-20 h-20 rounded-3xl bg-red-50 text-[#E63946] flex items-center justify-center border border-red-200/60 shadow-sm">
            <Heart className="w-10 h-10" />
          </div>
        );
      case 'search':
        return (
          <div className="w-20 h-20 rounded-3xl bg-stone-50 text-stone-700 flex items-center justify-center border border-stone-200/80 shadow-sm">
            <Search className="w-10 h-10" />
          </div>
        );
      case 'orders':
        return (
          <div className="w-20 h-20 rounded-3xl bg-red-50 text-[#E63946] flex items-center justify-center border border-red-200/60 shadow-sm">
            <PackageOpen className="w-10 h-10" />
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 rounded-3xl bg-stone-50 text-stone-600 flex items-center justify-center border border-stone-200 shadow-sm">
            <Sparkles className="w-10 h-10" />
          </div>
        );
    }
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-dashed border-stone-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 shadow-sm">
      <div className="mb-5">{renderIcon()}</div>
      <h3 className="text-xl font-bold text-stone-900 tracking-tight">{title}</h3>
      <p className="text-sm text-stone-500 mt-2 max-w-sm leading-relaxed">{description}</p>

      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref}>
              <Button size="md" variant="primary">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button size="md" variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
