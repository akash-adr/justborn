'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../lib/types';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  subtotal: number;
  itemCount: number;
  freeShippingThreshold: number;
  shippingFee: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'justborn_cart_v1';
const FREE_SHIPPING_THRESHOLD = 75;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        // Pre-seed with 1 lovely item so cart isn't empty out-of-the-box for demo
        import('../lib/mock-data').then(({ PRODUCTS }) => {
          if (PRODUCTS[0]) {
            setItems([
              {
                id: `cart-${PRODUCTS[0].id}`,
                product: PRODUCTS[0],
                quantity: 1,
              },
            ]);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to read cart from localStorage', e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save cart to localStorage', e);
      }
    }
  }, [items, mounted]);

  const addToCart = (product: Product, quantity = 1, openDrawer = true) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: `cart-${product.id}-${Date.now()}`, product, quantity }];
    });

    // Delightful micro-confetti burst
    try {
      confetti({
        particleCount: 28,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#E76F51', '#E9C46A', '#2A9D8F', '#F4A261'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore
    }

    showToast({
      type: 'success',
      title: 'Added to Toy Basket! 🎁',
      message: `${quantity} × ${product.name} added.`,
    });

    if (openDrawer) {
      setCartDrawerOpen(true);
    }
  };

  const removeFromCart = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    if (item) {
      showToast({
        type: 'info',
        title: 'Removed from Basket',
        message: `${item.product.name} was removed.`,
      });
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : 8.5;

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
