'use server';

import { serverCartService, ClientCartInputItem, ServiceResult } from '@/lib/services/server/cartService';
import { CartCalculationResult } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Read authenticated user's cart from Supabase.
 */
export async function getCartAction(): Promise<ServiceResult<CartCalculationResult>> {
  return serverCartService.getUserCart();
}

/**
 * Server Action: Add an item to the cart with server-side availability & inventory validation.
 */
export async function addToCartAction(
  productId: string,
  quantity = 1,
  variantId?: string | null
): Promise<ServiceResult<{ cartItemId: string; quantity: number }>> {
  const result = await serverCartService.addToCart(productId, quantity, variantId);
  if (result.success) {
    revalidatePath('/cart');
    revalidatePath('/shop');
  }
  return result;
}

/**
 * Server Action: Update cart item quantity with server-side stock validation.
 */
export async function updateCartQuantityAction(
  cartItemId: string,
  quantity: number
): Promise<ServiceResult<{ quantity: number }>> {
  const result = await serverCartService.updateQuantity(cartItemId, quantity);
  if (result.success) {
    revalidatePath('/cart');
  }
  return result;
}

/**
 * Server Action: Remove item from cart.
 */
export async function removeFromCartAction(cartItemId: string): Promise<ServiceResult<{ id: string }>> {
  const result = await serverCartService.removeFromCart(cartItemId);
  if (result.success) {
    revalidatePath('/cart');
  }
  return result;
}

/**
 * Server Action: Clear authenticated user's cart.
 */
export async function clearCartAction(): Promise<ServiceResult<void>> {
  const result = await serverCartService.clearCart();
  if (result.success) {
    revalidatePath('/cart');
  }
  return result;
}

/**
 * Server Action: Calculate totals on the server.
 * - Retrieves authentic prices from Supabase
 * - Validates stock
 * - Never trusts client prices
 */
export async function calculateCartTotalsAction(
  items: ClientCartInputItem[],
  promoCode?: string
): Promise<ServiceResult<CartCalculationResult>> {
  return serverCartService.calculateTotals(items, promoCode);
}

/**
 * Server Action: Synchronize guest cart into Supabase upon login.
 * Enforces database unique constraint to prevent duplicate rows.
 */
export async function syncCartAction(
  items: ClientCartInputItem[]
): Promise<ServiceResult<CartCalculationResult>> {
  const result = await serverCartService.syncGuestCart(items);
  if (result.success) {
    revalidatePath('/cart');
  }
  return result;
}
