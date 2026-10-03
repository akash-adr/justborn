import { createClient } from '@/lib/supabase/client';
import { CartItem, Product } from '@/lib/types';
import { mapDbProductToProduct } from './productService';

export const cartService = {
  /**
   * Fetch all cart items for a logged-in user from Supabase.
   */
  async fetchUserCart(userId: string): Promise<CartItem[]> {
    try {
      const supabase: any = createClient();
      const { data, error } = await supabase
        .from('cart_items')
        .select('id, quantity, variant_id, products(*, categories(*), product_images(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching user cart from Supabase:', error);
        return [];
      }

      if (!data) return [];

      return data
        .filter((row: any) => row.products)
        .map((row: any) => ({
          id: row.id,
          product: mapDbProductToProduct(row.products),
          quantity: row.quantity,
        }));
    } catch (err) {
      console.error('Unexpected error fetching user cart:', err);
      return [];
    }
  },

  /**
   * Add or update an item in the user's Supabase cart.
   */
  async upsertCartItem(
    userId: string,
    productId: string,
    quantity: number,
    variantId?: string | null
  ): Promise<{ id?: string; error?: string }> {
    try {
      const supabase: any = createClient();

      // Check if item already exists in user's cart
      const { data: existing, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing cart item:', checkError);
      }

      if (existing) {
        const newQty = existing.quantity + quantity;
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error updating cart item quantity:', updateError);
          return { error: updateError.message };
        }
        return { id: existing.id };
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity,
            variant_id: variantId || null,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting cart item:', insertError);
          return { error: insertError.message };
        }
        return { id: inserted?.id };
      }
    } catch (err: any) {
      console.error('Unexpected error in upsertCartItem:', err);
      return { error: err.message };
    }
  },

  /**
   * Update quantity of a specific cart item row in Supabase.
   */
  async updateQuantity(
    userId: string,
    cartItemId: string,
    quantity: number
  ): Promise<boolean> {
    try {
      const supabase: any = createClient();
      if (quantity <= 0) {
        return this.removeItem(userId, cartItemId);
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating cart item quantity:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error updating cart quantity:', err);
      return false;
    }
  },

  /**
   * Remove a cart item row in Supabase.
   */
  async removeItem(userId: string, cartItemId: string): Promise<boolean> {
    try {
      const supabase: any = createClient();
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting cart item:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error deleting cart item:', err);
      return false;
    }
  },

  /**
   * Clear all items in the user's Supabase cart.
   */
  async clearCart(userId: string): Promise<boolean> {
    try {
      const supabase: any = createClient();
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing user cart:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Unexpected error clearing user cart:', err);
      return false;
    }
  },

  /**
   * Synchronize guest/local items with Supabase upon user login.
   */
  async syncLocalCart(
    userId: string,
    localItems: CartItem[]
  ): Promise<CartItem[]> {
    try {
      if (!localItems || localItems.length === 0) {
        return this.fetchUserCart(userId);
      }

      const supabase: any = createClient();

      // Fetch existing remote cart items
      const remoteItems = await this.fetchUserCart(userId);
      const remoteProductMap = new Map<string, CartItem>();
      remoteItems.forEach((item) => {
        remoteProductMap.set(item.product.id, item);
      });

      // Synchronize each local item
      for (const localItem of localItems) {
        const existingRemote = remoteProductMap.get(localItem.product.id);
        const maxStock = localItem.product.stockCount || 99;

        if (existingRemote) {
          const mergedQty = Math.min(existingRemote.quantity + localItem.quantity, maxStock);
          if (mergedQty !== existingRemote.quantity) {
            await supabase
              .from('cart_items')
              .update({ quantity: mergedQty })
              .eq('id', existingRemote.id);
          }
        } else {
          const qty = Math.min(localItem.quantity, maxStock);
          await supabase.from('cart_items').insert({
            user_id: userId,
            product_id: localItem.product.id,
            quantity: qty,
          });
        }
      }

      // Re-fetch unified remote cart
      return this.fetchUserCart(userId);
    } catch (err) {
      console.error('Error synchronizing cart with Supabase:', err);
      return localItems;
    }
  },
};
