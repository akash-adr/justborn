'use server';

import { serverWishlistService } from '@/lib/services/server/wishlistService';
import { Product } from '@/lib/types';
import { ServiceResult } from '@/lib/services/server/cartService';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Read authenticated user's wishlist from Supabase.
 */
export async function getWishlistAction(): Promise<ServiceResult<Product[]>> {
  return serverWishlistService.getUserWishlist();
}

/**
 * Server Action: Add a product to the user's wishlist in Supabase.
 */
export async function addToWishlistAction(
  productId: string
): Promise<ServiceResult<{ productId: string }>> {
  const result = await serverWishlistService.addToWishlist(productId);
  if (result.success) {
    revalidatePath('/wishlist');
  }
  return result;
}

/**
 * Server Action: Remove a product from the user's wishlist in Supabase.
 */
export async function removeFromWishlistAction(
  productId: string
): Promise<ServiceResult<{ productId: string }>> {
  const result = await serverWishlistService.removeFromWishlist(productId);
  if (result.success) {
    revalidatePath('/wishlist');
  }
  return result;
}

/**
 * Server Action: Move a wishlist product to the cart on the server.
 * Validates stock, inserts into cart_items, removes from wishlist_items.
 */
export async function moveToCartAction(
  productId: string,
  quantity = 1,
  variantId?: string | null
): Promise<ServiceResult<{ cartItemId: string; quantity: number }>> {
  const result = await serverWishlistService.moveToCart(productId, quantity, variantId);
  if (result.success) {
    revalidatePath('/wishlist');
    revalidatePath('/cart');
  }
  return result;
}

/**
 * Server Action: Clear authenticated user's wishlist.
 */
export async function clearWishlistAction(): Promise<ServiceResult<void>> {
  const result = await serverWishlistService.clearWishlist();
  if (result.success) {
    revalidatePath('/wishlist');
  }
  return result;
}

/**
 * Server Action: Synchronize guest wishlist to Supabase after login.
 */
export async function syncWishlistAction(
  productIds: string[]
): Promise<ServiceResult<Product[]>> {
  const result = await serverWishlistService.syncGuestWishlist(productIds);
  if (result.success) {
    revalidatePath('/wishlist');
  }
  return result;
}
