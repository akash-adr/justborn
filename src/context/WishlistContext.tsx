'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../lib/types';
import { useToast } from './ToastContext';

interface WishlistContextType {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'justborn_wishlist_v1';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to read wishlist from localStorage', e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save wishlist to localStorage', e);
      }
    }
  }, [items, mounted]);

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      showToast({
        type: 'info',
        title: 'Removed from Wishlist',
        message: `${product.name} was removed from your saved favorites.`,
      });
    } else {
      setItems((prev) => [...prev, product]);
      showToast({
        type: 'success',
        title: 'Saved to Wishlist! ❤️',
        message: `${product.name} was added to your saved favorites.`,
      });
    }
  };

  const removeFromWishlist = (productId: string) => {
    const item = items.find((p) => p.id === productId);
    setItems((prev) => prev.filter((p) => p.id !== productId));
    if (item) {
      showToast({
        type: 'info',
        title: 'Removed from Wishlist',
        message: `${item.name} was removed.`,
      });
    }
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
