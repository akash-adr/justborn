import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { CartItem, Product, CartCalculationResult } from '@/lib/types';
import { mapDbProductToProduct } from '@/lib/services/server/productService';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

export interface ClientCartInputItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

export const VALID_PROMOS: Record<string, { type: 'percentage' | 'fixed'; value: number; description: string }> = {
  JUSTBORN10: { type: 'percentage', value: 10, description: '10% Welcome Discount' },
  HEIRLOOM500: { type: 'fixed', value: 500, description: '₹500 Playroom Gift Coupon' },
  MONTESSORI20: { type: 'percentage', value: 20, description: '20% Montessori Explorer Savings' },
};

/**
 * Server Cart Service:
 * - Secure, user-specific operations via authenticated session
 * - Server-side product availability and inventory validation
 * - Server-side price calculation directly from Supabase (never trusts client price)
 * - Uses database unique constraints to prevent duplicates
 */
export const serverCartService = {
  /**
   * Read the authenticated user's cart securely from Supabase.
   */
  async getUserCart(): Promise<ServiceResult<CartCalculationResult>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to access your cart.',
        };
      }

      const supabase: any = await createClient();

      // Query only the authenticated user's cart items
      const { data: rows, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          variant_id,
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
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error reading user cart from Supabase:', error);
        return {
          success: false,
          error: 'DATABASE_ERROR',
          message: 'Unable to retrieve your cart. Please try again.',
        };
      }

      const items: CartItem[] = [];
      const stockIssues: Array<{
        productId: string;
        productName: string;
        requestedQuantity: number;
        availableStock: number;
        adjustedQuantity: number;
      }> = [];

      let subtotal = 0;

      for (const row of rows || []) {
        const prodRow = row.products;
        if (!prodRow || !prodRow.is_active) {
          // Inactive or deleted product: skip or mark unavailable
          continue;
        }

        const product = mapDbProductToProduct(prodRow);

        // Find variant if specified
        let unitPrice = Number(prodRow.price);
        let availableStock = Number(prodRow.stock_quantity ?? 0);
        let selectedVariant: any = null;

        if (row.variant_id && prodRow.product_variants) {
          const v = prodRow.product_variants.find((vr: any) => vr.id === row.variant_id);
          if (v) {
            selectedVariant = {
              id: v.id,
              productId: v.product_id,
              name: v.name,
              sku: v.sku,
              price: Number(v.price),
              stockQuantity: Number(v.stock_quantity),
              attributes: v.attributes,
            };
            unitPrice = Number(v.price);
            availableStock = Math.min(availableStock, Number(v.stock_quantity ?? 0));
          }
        }

        // Validate stock: clamp quantity if necessary
        let validatedQuantity = row.quantity;
        if (validatedQuantity > availableStock) {
          stockIssues.push({
            productId: product.id,
            productName: product.name,
            requestedQuantity: row.quantity,
            availableStock,
            adjustedQuantity: Math.max(0, availableStock),
          });
          validatedQuantity = Math.max(0, availableStock);

          // Update the database to reflect the available stock
          if (validatedQuantity > 0) {
            await supabase
              .from('cart_items')
              .update({ quantity: validatedQuantity })
              .eq('id', row.id)
              .eq('user_id', user.id);
          } else {
            await supabase
              .from('cart_items')
              .delete()
              .eq('id', row.id)
              .eq('user_id', user.id);
            continue;
          }
        }

        // Never trust client price: use verified DB unitPrice
        const verifiedProduct = {
          ...product,
          price: unitPrice,
          stockCount: availableStock,
          inStock: availableStock > 0,
        };

        subtotal += unitPrice * validatedQuantity;

        items.push({
          id: row.id,
          product: verifiedProduct,
          quantity: validatedQuantity,
          variantId: row.variant_id || null,
          variant: selectedVariant,
        });
      }

      const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
      const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : STANDARD_SHIPPING_FEE;
      const total = subtotal + shippingFee;

      return {
        success: true,
        data: {
          items,
          subtotal,
          shippingFee,
          freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
          discountAmount: 0,
          itemCount,
          total,
          stockIssues: stockIssues.length > 0 ? stockIssues : undefined,
        },
      };
    } catch (err: any) {
      console.error('Unexpected error in getUserCart:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Add item to authenticated user's cart with server-side stock validation
   * and duplicate prevention via database constraints.
   */
  async addToCart(
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
          message: 'You must be signed in to add items to your cart.',
        };
      }

      if (quantity <= 0) {
        return {
          success: false,
          error: 'INVALID_QUANTITY',
          message: 'Quantity must be at least 1.',
        };
      }

      const supabase: any = await createClient();

      // 1. Validate Product Availability & Stock directly from Supabase
      const { data: product, error: prodError } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, is_active')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (prodError || !product) {
        return {
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: 'This product is no longer available.',
        };
      }

      let maxStock = Number(product.stock_quantity ?? 0);

      // Validate Variant if supplied
      if (variantId) {
        const { data: variant, error: varError } = await supabase
          .from('product_variants')
          .select('id, product_id, price, stock_quantity')
          .eq('id', variantId)
          .eq('product_id', productId)
          .single();

        if (varError || !variant) {
          return {
            success: false,
            error: 'VARIANT_NOT_FOUND',
            message: 'Selected product variant is invalid.',
          };
        }

        maxStock = Math.min(maxStock, Number(variant.stock_quantity ?? 0));
      }

      if (maxStock <= 0) {
        return {
          success: false,
          error: 'OUT_OF_STOCK',
          message: `${product.name} is currently out of stock.`,
        };
      }

      // 2. Check for existing item to prevent duplicate rows
      let existingQuery = supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (variantId) {
        existingQuery = existingQuery.eq('variant_id', variantId);
      } else {
        existingQuery = existingQuery.is('variant_id', null);
      }

      const { data: existingItem, error: findError } = await existingQuery.maybeSingle();

      if (findError) {
        console.error('Error querying existing cart item:', findError);
      }

      if (existingItem) {
        // Update existing item quantity up to available inventory
        const newQty = Math.min(maxStock, existingItem.quantity + quantity);
        if (existingItem.quantity >= maxStock) {
          return {
            success: false,
            error: 'MAX_STOCK_REACHED',
            message: `Maximum available inventory (${maxStock} units) is already in your basket.`,
          };
        }

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQty })
          .eq('id', existingItem.id)
          .eq('user_id', user.id);

        if (updateError) {
          return {
            success: false,
            error: 'UPDATE_FAILED',
            message: 'Failed to update item quantity in cart.',
          };
        }

        return {
          success: true,
          data: { cartItemId: existingItem.id, quantity: newQty },
          message: `Basket updated. Quantity set to ${newQty}.`,
        };
      } else {
        // Insert new cart item clamped to max stock
        const insertQty = Math.min(quantity, maxStock);

        // Attempt insert, catching potential unique constraint violation gracefully
        const { data: inserted, error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            variant_id: variantId || null,
            quantity: insertQty,
          })
          .select('id, quantity')
          .single();

        if (insertError) {
          // Code 23505 = duplicate key violates unique constraint
          if (insertError.code === '23505') {
            // Recover: fetch the conflicted row and update its quantity
            const { data: conflictRow } = await existingQuery.maybeSingle();
            if (conflictRow) {
              const updatedQty = Math.min(maxStock, conflictRow.quantity + insertQty);
              await supabase
                .from('cart_items')
                .update({ quantity: updatedQty })
                .eq('id', conflictRow.id)
                .eq('user_id', user.id);

              return {
                success: true,
                data: { cartItemId: conflictRow.id, quantity: updatedQty },
                message: 'Item quantity updated in basket.',
              };
            }
          }

          console.error('Error inserting cart item:', insertError);
          return {
            success: false,
            error: 'INSERT_FAILED',
            message: insertError.message || 'Failed to add item to basket.',
          };
        }

        return {
          success: true,
          data: { cartItemId: inserted.id, quantity: inserted.quantity },
          message: 'Item added to basket.',
        };
      }
    } catch (err: any) {
      console.error('Unexpected error in addToCart:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Update quantity of a specific cart item for the authenticated user.
   * Validates stock limits server-side.
   */
  async updateQuantity(
    cartItemId: string,
    requestedQuantity: number
  ): Promise<ServiceResult<{ quantity: number }>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to modify your cart.',
        };
      }

      const supabase: any = await createClient();

      if (requestedQuantity <= 0) {
        await this.removeFromCart(cartItemId);
        return {
          success: true,
          data: { quantity: 0 },
          message: 'Item removed from basket.',
        };
      }

      // Fetch the cart item, verifying ownership
      const { data: item, error: fetchError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          variant_id,
          product_id,
          products (name, stock_quantity, is_active),
          product_variants (stock_quantity)
        `)
        .eq('id', cartItemId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !item) {
        return {
          success: false,
          error: 'ITEM_NOT_FOUND',
          message: 'Cart item not found or does not belong to you.',
        };
      }

      // Determine max stock
      let maxStock = Number(item.products?.stock_quantity ?? 0);
      if (item.variant_id && item.product_variants) {
        maxStock = Math.min(maxStock, Number(item.product_variants.stock_quantity ?? 0));
      }

      const finalQty = Math.min(requestedQuantity, maxStock);

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: finalQty })
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (updateError) {
        return {
          success: false,
          error: 'UPDATE_FAILED',
          message: 'Failed to update quantity.',
        };
      }

      return {
        success: true,
        data: { quantity: finalQty },
        message: requestedQuantity > maxStock
          ? `Quantity set to max available stock (${maxStock}).`
          : 'Quantity updated.',
      };
    } catch (err: any) {
      console.error('Unexpected error in updateQuantity:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Delete an item from the user's cart, verifying ownership.
   */
  async removeFromCart(cartItemId: string): Promise<ServiceResult<{ id: string }>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to modify your cart.',
        };
      }

      const supabase: any = await createClient();

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) {
        return {
          success: false,
          error: 'DELETE_FAILED',
          message: 'Failed to remove item from basket.',
        };
      }

      return {
        success: true,
        data: { id: cartItemId },
        message: 'Item removed from basket.',
      };
    } catch (err: any) {
      console.error('Unexpected error in removeFromCart:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Clear all items in the authenticated user's cart.
   */
  async clearCart(): Promise<ServiceResult<void>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to clear your cart.',
        };
      }

      const supabase: any = await createClient();

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        return {
          success: false,
          error: 'CLEAR_FAILED',
          message: 'Failed to clear basket.',
        };
      }

      return {
        success: true,
        message: 'Cart cleared successfully.',
      };
    } catch (err: any) {
      console.error('Unexpected error in clearCart:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Calculate totals server-side (retrieving real prices from Supabase & validating stock).
   * Supports optional promo codes validated on the server.
   * NEVER trusts client price.
   */
  async calculateTotals(
    inputItems: ClientCartInputItem[],
    promoCode?: string
  ): Promise<ServiceResult<CartCalculationResult>> {
    try {
      if (!inputItems || inputItems.length === 0) {
        return {
          success: true,
          data: {
            items: [],
            subtotal: 0,
            shippingFee: 0,
            freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
            discountAmount: 0,
            itemCount: 0,
            total: 0,
          },
        };
      }

      const supabase: any = await createClient();
      const productIds = Array.from(new Set(inputItems.map((i) => i.productId)));

      // Fetch authentic product data from Supabase
      const { data: dbProducts, error: prodError } = await supabase
        .from('products')
        .select(`
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
        `)
        .in('id', productIds)
        .eq('is_active', true);

      if (prodError || !dbProducts) {
        return {
          success: false,
          error: 'DATABASE_ERROR',
          message: 'Failed to fetch current product prices.',
        };
      }

      const productMap = new Map<string, any>();
      dbProducts.forEach((p: any) => productMap.set(p.id, p));

      const validatedItems: CartItem[] = [];
      const stockIssues: Array<{
        productId: string;
        productName: string;
        requestedQuantity: number;
        availableStock: number;
        adjustedQuantity: number;
      }> = [];

      let subtotal = 0;

      for (const input of inputItems) {
        const prodRow = productMap.get(input.productId);
        if (!prodRow) continue;

        const product = mapDbProductToProduct(prodRow);
        let unitPrice = Number(prodRow.price);
        let availableStock = Number(prodRow.stock_quantity ?? 0);
        let selectedVariant: any = null;

        if (input.variantId && prodRow.product_variants) {
          const v = prodRow.product_variants.find((vr: any) => vr.id === input.variantId);
          if (v) {
            selectedVariant = {
              id: v.id,
              productId: v.product_id,
              name: v.name,
              sku: v.sku,
              price: Number(v.price),
              stockQuantity: Number(v.stock_quantity),
              attributes: v.attributes,
            };
            unitPrice = Number(v.price);
            availableStock = Math.min(availableStock, Number(v.stock_quantity ?? 0));
          }
        }

        // Clamp quantity to available stock
        let validatedQuantity = input.quantity;
        if (validatedQuantity > availableStock) {
          stockIssues.push({
            productId: product.id,
            productName: product.name,
            requestedQuantity: input.quantity,
            availableStock,
            adjustedQuantity: Math.max(0, availableStock),
          });
          validatedQuantity = Math.max(0, availableStock);
        }

        if (validatedQuantity <= 0) continue;

        subtotal += unitPrice * validatedQuantity;

        validatedItems.push({
          id: `cart-${product.id}-${input.variantId || 'base'}`,
          product: {
            ...product,
            price: unitPrice,
            stockCount: availableStock,
            inStock: availableStock > 0,
          },
          quantity: validatedQuantity,
          variantId: input.variantId || null,
          variant: selectedVariant,
        });
      }

      // Calculate promo discount on server
      let discountAmount = 0;
      if (promoCode) {
        const promo = VALID_PROMOS[promoCode.trim().toUpperCase()];
        if (promo && subtotal > 0) {
          if (promo.type === 'percentage') {
            discountAmount = Math.round((subtotal * promo.value) / 100);
          } else if (promo.type === 'fixed') {
            discountAmount = Math.min(subtotal, promo.value);
          }
        }
      }

      const itemCount = validatedItems.reduce((sum, i) => sum + i.quantity, 0);
      const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || validatedItems.length === 0 ? 0 : STANDARD_SHIPPING_FEE;
      const total = Math.max(0, subtotal - discountAmount + shippingFee);

      return {
        success: true,
        data: {
          items: validatedItems,
          subtotal,
          shippingFee,
          freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
          discountAmount,
          itemCount,
          total,
          stockIssues: stockIssues.length > 0 ? stockIssues : undefined,
        },
      };
    } catch (err: any) {
      console.error('Unexpected error in calculateTotals:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'Failed to calculate cart totals.',
      };
    }
  },

  /**
   * Synchronize guest/local cart items after login:
   * - Validates product stock and active state
   * - Merges with existing items in user's Supabase cart
   * - Enforces database unique constraint to prevent duplicate rows
   * - Returns the clean, freshly calculated user cart
   */
  async syncGuestCart(guestItems: ClientCartInputItem[]): Promise<ServiceResult<CartCalculationResult>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'User must be signed in to sync cart.',
        };
      }

      if (!guestItems || guestItems.length === 0) {
        return this.getUserCart();
      }

      const supabase: any = await createClient();

      for (const item of guestItems) {
        if (!item.productId || item.quantity <= 0) continue;

        // Call addToCart for each item: handles stock validation and constraint handling
        await this.addToCart(item.productId, item.quantity, item.variantId);
      }

      // Return unified, server-validated cart
      return this.getUserCart();
    } catch (err: any) {
      console.error('Error synchronizing guest cart:', err);
      return {
        success: false,
        error: 'SYNC_FAILED',
        message: err.message || 'Cart synchronization failed.',
      };
    }
  },
};
