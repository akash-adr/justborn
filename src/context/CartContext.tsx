'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product, CartItem, CartCalculationResult } from '../lib/types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import {
  getCartAction,
  addToCartAction,
  updateCartQuantityAction,
  removeFromCartAction,
  clearCartAction,
  syncCartAction,
  calculateCartTotalsAction,
} from '@/app/actions/cart';
import { validateCouponAction } from '@/app/actions/coupon';
import confetti from 'canvas-confetti';

export interface AppliedPromo {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean, variantId?: string | null) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  subtotal: number;
  itemCount: number;
  freeShippingThreshold: number;
  shippingFee: number;
  appliedPromo: AppliedPromo | null;
  discountAmount: number;
  finalTotal: number;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string; errorType?: string }>;
  removePromoCode: () => void;
  isSyncing: boolean;
  refreshCart: () => Promise<void>;
  canIncreaseQuantity: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'justborn_cart_v2';
const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

const VALID_PROMOS: Record<string, AppliedPromo> = {
  JUSTBORN10: { code: 'JUSTBORN10', type: 'percentage', value: 10, description: '10% Welcome Discount' },
  HEIRLOOM500: { code: 'HEIRLOOM500', type: 'fixed', value: 500, description: '₹500 Playroom Gift Coupon' },
  MONTESSORI20: { code: 'MONTESSORI20', type: 'percentage', value: 20, description: '20% Montessori Explorer Savings' },
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
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
      const storedPromo = localStorage.getItem('justborn_promo_v2');
      if (storedPromo) {
        setAppliedPromo(JSON.parse(storedPromo));
      }
    } catch (e) {
      console.warn('Failed to read cart from localStorage', e);
    }
    setMounted(true);
  }, []);

  // Save guest cart to localStorage when unauthenticated
  useEffect(() => {
    if (mounted && !user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save cart to localStorage', e);
      }
    }
  }, [items, mounted, user]);

  // Save promo code
  useEffect(() => {
    if (mounted) {
      try {
        if (appliedPromo) {
          localStorage.setItem('justborn_promo_v2', JSON.stringify(appliedPromo));
        } else {
          localStorage.removeItem('justborn_promo_v2');
        }
      } catch (e) {
        console.warn('Failed to save promo to localStorage', e);
      }
    }
  }, [appliedPromo, mounted]);

  // Refresh cart from server for authenticated user
  const refreshCart = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getCartAction();
      if (res.success && res.data) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to refresh cart from server:', err);
    }
  }, [user]);

  // 2. Authentication change / Cart Synchronization
  useEffect(() => {
    if (!mounted) return;

    async function handleAuthSync() {
      // User just logged in
      if (user && user.id !== prevUserIdRef.current) {
        setIsSyncing(true);
        try {
          let localItems: CartItem[] = [];
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) localItems = JSON.parse(stored);
          } catch {
            localItems = items;
          }

          // Format items for server synchronization (never trusts prices)
          const syncPayload = localItems.map((i) => ({
            productId: i.product.id,
            variantId: i.variantId || null,
            quantity: i.quantity,
          }));

          // Server Action performs stock validation, price retrieval, and unique constraint upsert
          const syncResult = await syncCartAction(syncPayload);

          if (syncResult.success && syncResult.data) {
            setItems(syncResult.data.items);
            localStorage.removeItem(STORAGE_KEY);

            if (localItems.length > 0) {
              showToast({
                type: 'info',
                title: 'Basket Synchronized 🧸',
                message: 'Your guest items have been safely saved to your account.',
              });
            }
          } else {
            // Fallback: fetch current user cart
            await refreshCart();
          }
        } catch (err) {
          console.error('Error synchronizing cart on login:', err);
          await refreshCart();
        } finally {
          setIsSyncing(false);
        }
      } else if (!user && prevUserIdRef.current) {
        // User logged out: switch back to empty guest cart
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
      }

      prevUserIdRef.current = user?.id ?? null;
    }

    handleAuthSync();
  }, [user, mounted, refreshCart]);

  // Helper: check if item can have quantity increased
  const canIncreaseQuantity = useCallback(
    (itemId: string): boolean => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return false;
      const maxStock = item.product.stockCount ?? 99;
      return item.quantity < maxStock;
    },
    [items]
  );

  // Add to cart with server-side stock validation and optimistic UI
  const addToCart = async (
    product: Product,
    quantity = 1,
    openDrawer = true,
    variantId?: string | null
  ): Promise<boolean> => {
    const maxStock = product.stockCount ?? (product.inStock ? 99 : 0);

    if (maxStock <= 0 || !product.inStock) {
      showToast({
        type: 'error',
        title: 'Out of Stock',
        message: `${product.name} is currently unavailable.`,
      });
      return false;
    }

    const existing = items.find((i) => i.product.id === product.id && i.variantId === (variantId || null));
    const currentQty = existing ? existing.quantity : 0;
    const targetQty = currentQty + quantity;

    if (targetQty > maxStock) {
      const allowedAdd = Math.max(0, maxStock - currentQty);
      if (allowedAdd <= 0) {
        showToast({
          type: 'warning',
          title: 'Maximum Stock Reached',
          message: `All available inventory for ${product.name} (${maxStock} units) is already in your basket.`,
        });
        if (openDrawer) setCartDrawerOpen(true);
        return false;
      }

      // Optimistic update clamped to max stock
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === product.id && i.variantId === (variantId || null)
            ? { ...i, quantity: maxStock }
            : i
        )
      );

      showToast({
        type: 'warning',
        title: 'Adjusted to Available Stock',
        message: `Only ${maxStock} units available. Basket updated to max inventory.`,
      });

      if (user) {
        await addToCartAction(product.id, allowedAdd, variantId);
        await refreshCart();
      }
      if (openDrawer) setCartDrawerOpen(true);
      return true;
    }

    // Optimistic UI update
    const tempId = existing ? existing.id : `cart-${product.id}-${Date.now()}`;
    setItems((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.variantId === (variantId || null)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: tempId,
          product,
          quantity,
          variantId: variantId || null,
        },
      ];
    });

    // Micro-confetti burst
    try {
      confetti({
        particleCount: 26,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#E63946', '#DC2626', '#FF6B6B', '#FFD166'],
        disableForReducedMotion: true,
      });
    } catch {}

    showToast({
      type: 'success',
      title: 'Added to Toy Basket! 🎁',
      message: `${quantity} × ${product.name} added.`,
    });

    if (openDrawer) {
      setCartDrawerOpen(true);
    }

    // Server-side persistence & validation
    if (user) {
      try {
        const res = await addToCartAction(product.id, quantity, variantId);
        if (!res.success) {
          showToast({
            type: 'error',
            title: 'Cart Update Issue',
            message: res.message || 'Could not save item to cloud basket.',
          });
          // Rollback on server error
          await refreshCart();
          return false;
        } else {
          await refreshCart();
        }
      } catch (err) {
        console.error('Failed to sync add to cart with server:', err);
      }
    }

    return true;
  };

  // Remove from cart
  const removeFromCart = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // Optimistic removal
    setItems((prev) => prev.filter((i) => i.id !== itemId));

    showToast({
      type: 'info',
      title: 'Removed from Basket',
      message: `${item.product.name} was removed.`,
    });

    if (user) {
      try {
        await removeFromCartAction(itemId);
      } catch (err) {
        console.error('Failed to remove cart item from server:', err);
        await refreshCart();
      }
    }
  };

  // Update quantity with stock validation
  const updateQuantity = async (itemId: string, requestedQuantity: number): Promise<boolean> => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return false;

    if (requestedQuantity <= 0) {
      await removeFromCart(itemId);
      return true;
    }

    const maxStock = item.product.stockCount ?? 99;

    if (requestedQuantity > maxStock) {
      showToast({
        type: 'warning',
        title: 'Maximum Stock Limit',
        message: `Only ${maxStock} units of ${item.product.name} are available in stock.`,
      });

      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: maxStock } : i))
      );

      if (user) {
        await updateCartQuantityAction(itemId, maxStock);
      }
      return false;
    }

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity: requestedQuantity } : i))
    );

    if (user) {
      try {
        const res = await updateCartQuantityAction(itemId, requestedQuantity);
        if (!res.success) {
          showToast({
            type: 'error',
            title: 'Inventory Notice',
            message: res.message || 'Failed to update quantity.',
          });
          await refreshCart();
          return false;
        }
      } catch (err) {
        console.error('Error updating quantity on server:', err);
        await refreshCart();
      }
    }

    return true;
  };

  // Clear cart
  const clearCart = async () => {
    setItems([]);
    if (user) {
      try {
        await clearCartAction();
      } catch (err) {
        console.error('Failed to clear cart on server:', err);
      }
    }
  };

  // Subtotal and calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const shippingFee =
    subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0
      ? 0
      : STANDARD_SHIPPING_FEE;

  // Promo code calculation
  let discountAmount = 0;
  if (appliedPromo && subtotal > 0) {
    if (appliedPromo.type === 'percentage') {
      discountAmount = Math.round((subtotal * appliedPromo.value) / 100);
    } else if (appliedPromo.type === 'fixed') {
      discountAmount = Math.min(subtotal, appliedPromo.value);
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Promo code actions
  const applyPromoCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, message: 'Please enter a coupon code.', errorType: 'EMPTY' };
    }

    try {
      const res = await validateCouponAction(code, subtotal);
      if (res.success && res.coupon) {
        const promo: AppliedPromo = {
          code: res.coupon.code,
          type: res.coupon.type,
          value: res.coupon.value,
          description: res.coupon.description,
        };
        setAppliedPromo(promo);
        showToast({
          type: 'success',
          title: 'Coupon Applied! 🎉',
          message: res.message,
        });
        return { success: true, message: res.message };
      } else {
        showToast({
          type: 'error',
          title: res.errorType === 'EXPIRED' ? 'Coupon Expired' : res.errorType === 'MIN_AMOUNT' ? 'Minimum Spend Required' : 'Invalid Coupon',
          message: res.message,
        });
        return { success: false, message: res.message, errorType: res.errorType };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to validate coupon code.' };
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    showToast({
      type: 'info',
      title: 'Coupon Removed',
      message: 'The promotional code has been removed.',
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartDrawerOpen,
        setCartDrawerOpen,
        subtotal,
        itemCount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        shippingFee,
        appliedPromo,
        discountAmount,
        finalTotal,
        applyPromoCode,
        removePromoCode,
        isSyncing,
        refreshCart,
        canIncreaseQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
