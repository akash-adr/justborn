import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { Product } from '@/lib/types';
import { mapDbProductToProduct } from '@/lib/services/server/productService';
import { serverCartService, ServiceResult } from './cartService';

export const serverWishlistService = {
  /**
   * Read the authenticated user's wishlist from Supabase.
   */
  async getUserWishlist(): Promise<ServiceResult<Product[]>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to access your wishlist.',
        };
      }

      const supabase: any = await createClient();

      const { data: rows, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          created_at,
          products (
            id,
            name,
            slug,
            description,
            price,
            compare_at_price,
            sku,
            stock_quantity,
            age_group,
            brand,
            is_featured,
            is_active,
            categories (*),
            product_images (*),
            product_variants (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error reading wishlist from Supabase:', error);
        return {
          success: false,
          error: 'DATABASE_ERROR',
          message: 'Failed to retrieve your wishlist.',
        };
      }

      const products: Product[] = [];
      for (const row of rows || []) {
        if (!row.products || !row.products.is_active) continue;
        products.push(mapDbProductToProduct(row.products));
      }

      return {
        success: true,
        data: products,
      };
    } catch (err: any) {
      console.error('Unexpected error in getUserWishlist:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Add a product to the authenticated user's wishlist.
   * Enforces availability check and database unique constraint on (user_id, product_id).
   */
  async addToWishlist(productId: string): Promise<ServiceResult<{ productId: string }>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to save items to your wishlist.',
        };
      }

      const supabase: any = await createClient();

      // Validate that product exists and is active
      const { data: product, error: prodError } = await supabase
        .from('products')
        .select('id, name, is_active')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (prodError || !product) {
        return {
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: 'Product not found or unavailable.',
        };
      }

      // Upsert using the database unique constraint wishlist_items_user_id_product_id_key
      const { error: insertError } = await supabase
        .from('wishlist_items')
        .upsert(
          {
            user_id: user.id,
            product_id: productId,
          },
          { onConflict: 'user_id,product_id' }
        );

      if (insertError) {
        console.error('Error inserting into wishlist_items:', insertError);
        return {
          success: false,
          error: 'INSERT_FAILED',
          message: 'Failed to save item to wishlist.',
        };
      }

      return {
        success: true,
        data: { productId },
        message: `${product.name} saved to your wishlist.`,
      };
    } catch (err: any) {
      console.error('Unexpected error in addToWishlist:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Remove a product from the authenticated user's wishlist.
   */
  async removeFromWishlist(productId: string): Promise<ServiceResult<{ productId: string }>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to modify your wishlist.',
        };
      }

      const supabase: any = await createClient();

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from wishlist_items:', error);
        return {
          success: false,
          error: 'DELETE_FAILED',
          message: 'Failed to remove item from wishlist.',
        };
      }

      return {
        success: true,
        data: { productId },
        message: 'Item removed from your wishlist.',
      };
    } catch (err: any) {
      console.error('Unexpected error in removeFromWishlist:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Move item from wishlist to cart on the server:
   * - Validates inventory stock
   * - Adds to cart_items table
   * - Removes from wishlist_items table
   */
  async moveToCart(
    productId: string,
    quantity = 1,
    variantId?: string | null
  ): Promise<ServiceResult<{ cartItemId: string; quantity: number }>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to perform this action.',
        };
      }

      // 1. Add to cart using serverCartService (handles inventory validation & unique constraint)
      const cartResult = await serverCartService.addToCart(productId, quantity, variantId);
      if (!cartResult.success) {
        return cartResult;
      }

      // 2. Remove from wishlist
      await this.removeFromWishlist(productId);

      return {
        success: true,
        data: cartResult.data,
        message: 'Item moved from wishlist to basket.',
      };
    } catch (err: any) {
      console.error('Unexpected error in moveToCart:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'Failed to move item to basket.',
      };
    }
  },

  /**
   * Clear all wishlist items for the authenticated user.
   */
  async clearWishlist(): Promise<ServiceResult<void>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to clear your wishlist.',
        };
      }

      const supabase: any = await createClient();

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        return {
          success: false,
          error: 'CLEAR_FAILED',
          message: 'Failed to clear wishlist.',
        };
      }

      return {
        success: true,
        message: 'Wishlist cleared successfully.',
      };
    } catch (err: any) {
      console.error('Unexpected error in clearWishlist:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Synchronize guest/local wishlist items after login.
   * Inserts local items into wishlist_items, relying on onConflict to prevent duplicates.
   */
  async syncGuestWishlist(productIds: string[]): Promise<ServiceResult<Product[]>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User must be signed in to sync wishlist.',
        };
      }

      if (!productIds || productIds.length === 0) {
        return this.getUserWishlist();
      }

      const supabase: any = await createClient();

      const rowsToInsert = productIds.map((pid) => ({
        user_id: user.id,
        product_id: pid,
      }));

      // Unique constraint on (user_id, product_id) prevents duplicates
      await supabase.from('wishlist_items').upsert(rowsToInsert, {
        onConflict: 'user_id,product_id',
      });

      return this.getUserWishlist();
    } catch (err: any) {
      console.error('Error syncing guest wishlist:', err);
      return {
        success: false,
        error: 'SYNC_FAILED',
        message: err.message || 'Wishlist sync failed.',
      };
    }
  },
};
