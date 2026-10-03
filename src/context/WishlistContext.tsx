'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../lib/types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import {
  getWishlistAction,
  addToWishlistAction,
  removeFromWishlistAction,
  moveToCartAction,
  clearWishlistAction,
  syncWishlistAction,
} from '@/app/actions/wishlist';

interface WishlistContextType {
  items: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => Promise<void>;
  moveToCart: (product: Product, quantity?: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isSyncing: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'justborn_wishlist_v2';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { addToCart, refreshCart } = useCart();

  const [items, setItems] = useState<Product[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const prevUserIdRef = useRef<string | null>(null);

  // 1. Initial Load from LocalStorage for guest mode
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to read wishlist from localStorage', e);
    }
    setMounted(true);
  }, []);

  // Save guest wishlist to localStorage when unauthenticated
  useEffect(() => {
    if (mounted && !user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save wishlist to localStorage', e);
      }
    }
  }, [items, mounted, user]);

  // Refresh wishlist from server
  const refreshWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getWishlistAction();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Failed to refresh wishlist from server:', err);
    }
  }, [user]);

  // 2. User Login / Logout Synchronization
  useEffect(() => {
    if (!mounted) return;

    async function handleAuthSync() {
      // User just logged in
      if (user && user.id !== prevUserIdRef.current) {
        setIsSyncing(true);
        try {
          let localItems: Product[] = [];
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) localItems = JSON.parse(stored);
          } catch {
            localItems = items;
          }

          const productIds = localItems.map((p) => p.id);

          // Server Action synchronizes wishlist with Supabase (handling unique constraints)
          const syncResult = await syncWishlistAction(productIds);

          if (syncResult.success && syncResult.data) {
            setItems(syncResult.data);
            localStorage.removeItem(STORAGE_KEY);

            if (localItems.length > 0) {
              showToast({
                type: 'info',
                title: 'Wishlist Synchronized ❤️',
                message: 'Your saved favorite toys are synced to your account.',
              });
            }
          } else {
            await refreshWishlist();
          }
        } catch (err) {
          console.error('Failed to sync wishlist on login:', err);
          await refreshWishlist();
        } finally {
          setIsSyncing(false);
        }
      } else if (!user && prevUserIdRef.current) {
        // User logged out
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
      }

      prevUserIdRef.current = user?.id ?? null;
    }

    handleAuthSync();
  }, [user, mounted, refreshWishlist]);

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product: Product) => {
    const alreadySaved = isInWishlist(product.id);

    if (alreadySaved) {
      // Optimistic removal
      setItems((prev) => prev.filter((p) => p.id !== product.id));
      showToast({
        type: 'info',
        title: 'Removed from Wishlist',
        message: `${product.name} removed from your saved favorites.`,
      });

      if (user) {
        try {
          await removeFromWishlistAction(product.id);
        } catch (err) {
          console.error('Error removing from wishlist on server:', err);
          await refreshWishlist();
        }
      }
    } else {
      // Optimistic add
      setItems((prev) => [...prev, product]);
      showToast({
        type: 'success',
        title: 'Saved to Wishlist! ❤️',
        message: `${product.name} added to your saved favorites.`,
      });

      if (user) {
        try {
          const res = await addToWishlistAction(product.id);
          if (!res.success) {
            showToast({
              type: 'error',
              title: 'Wishlist Error',
              message: res.message || 'Could not save to cloud wishlist.',
            });
            await refreshWishlist();
          }
        } catch (err) {
          console.error('Error adding to wishlist on server:', err);
          await refreshWishlist();
        }
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const item = items.find((p) => p.id === productId);
    setItems((prev) => prev.filter((p) => p.id !== productId));
    if (item) {
      showToast({
        type: 'info',
        title: 'Removed from Wishlist',
        message: `${item.name} was removed.`,
      });
    }

    if (user) {
      try {
        await removeFromWishlistAction(productId);
      } catch (err) {
        console.error('Error removing from wishlist on server:', err);
        await refreshWishlist();
      }
    }
  };

  /**
   * Move item from wishlist to cart with server-side validation:
   * Adds product to cart, then removes from wishlist.
   */
  const moveToCart = async (product: Product, quantity = 1) => {
    if (user) {
      try {
        const res = await moveToCartAction(product.id, quantity);
        if (res.success) {
          setItems((prev) => prev.filter((p) => p.id !== product.id));
          await refreshCart();
          showToast({
            type: 'success',
            title: 'Moved to Toy Basket! 🎁',
            message: `${product.name} moved from your wishlist to your basket.`,
          });
        } else {
          showToast({
            type: 'warning',
            title: 'Could Not Move Item',
            message: res.message || 'Product is currently unavailable.',
          });
        }
      } catch (err) {
        console.error('Error in moveToCart on server:', err);
        // Fallback to client flow
        const added = await addToCart(product, quantity, false);
        if (added) {
          await removeFromWishlist(product.id);
        }
      }
    } else {
      // Guest mode
      const added = await addToCart(product, quantity, false);
      if (added) {
        await removeFromWishlist(product.id);
        showToast({
          type: 'success',
          title: 'Moved to Toy Basket! 🎁',
          message: `${product.name} moved from your wishlist to your basket.`,
        });
      }
    }
  };

  const clearWishlist = async () => {
    setItems([]);
    if (user) {
      try {
        await clearWishlistAction();
      } catch (err) {
        console.error('Error clearing wishlist on server:', err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveToCart,
        clearWishlist,
        isSyncing,
        refreshWishlist,
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
