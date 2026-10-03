import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types';
import { mapDbProductToProduct } from './productService';

export const wishlistService = {
  /**
   * Fetch all saved wishlist products for a user.
   */
  async fetchUserWishlist(userId: string): Promise<Product[]> {
    try {
      const supabase: any = createClient();
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id, product_id, created_at, products(*, categories(*), product_images(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user wishlist from Supabase:', error);
        return [];
      }

      if (!data) return [];

      return data
        .filter((row: any) => row.products)
        .map((row: any) => mapDbProductToProduct(row.products));
    } catch (err) {
      console.error('Unexpected error fetching user wishlist:', err);
      return [];
    }
  },

  /**
   * Add a product to the user's wishlist in Supabase.
   */
  async addToWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const supabase: any = createClient();
      const { error } = await supabase.from('wishlist_items').upsert(
        {
          user_id: userId,
          product_id: productId,
        },
        { onConflict: 'user_id,product_id' }
      );

      if (error) {
        console.error('Error adding to wishlist in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error adding to wishlist:', err);
      return false;
    }
  },

  /**
   * Remove a product from the user's wishlist in Supabase.
   */
  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const supabase: any = createClient();
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing from wishlist in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error removing from wishlist:', err);
      return false;
    }
  },

  /**
   * Clear all wishlist items for a user.
   */
  async clearWishlist(userId: string): Promise<boolean> {
    try {
      const supabase: any = createClient();
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing wishlist in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error clearing wishlist:', err);
      return false;
    }
  },

  /**
   * Synchronize guest/local wishlist items with Supabase after login.
   */
  async syncLocalWishlist(
    userId: string,
    localProducts: Product[]
  ): Promise<Product[]> {
    try {
      if (!localProducts || localProducts.length === 0) {
        return this.fetchUserWishlist(userId);
      }

      const supabase: any = createClient();
      const remoteProducts = await this.fetchUserWishlist(userId);
      const remoteIds = new Set(remoteProducts.map((p) => p.id));

      const itemsToInsert = localProducts
        .filter((p) => !remoteIds.has(p.id))
        .map((p) => ({
          user_id: userId,
          product_id: p.id,
        }));

      if (itemsToInsert.length > 0) {
        await supabase.from('wishlist_items').upsert(itemsToInsert, {
          onConflict: 'user_id,product_id',
        });
      }

      return this.fetchUserWishlist(userId);
    } catch (err) {
      console.error('Error synchronizing wishlist with Supabase:', err);
      return localProducts;
    }
  },
};
