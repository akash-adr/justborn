import { createAdminClient } from '@/lib/supabase/admin';
import { assertAdmin } from '@/lib/auth/server';

// ─── Shared Types ─────────────────────────────────────────────────────────────

interface AdminResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

// ─── Admin Guard ──────────────────────────────────────────────────────────────
// EVERY admin function calls this. It verifies role from the DATABASE (profiles
// table via createAdminClient), never from client metadata, JWT claims, or headers.

async function ensureAdmin(): Promise<{ userId: string }> {
  const { user } = await assertAdmin();
  return { userId: user.id };
}

// ─── Validation Constants ─────────────────────────────────────────────────────

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
const VALID_AGE_GROUPS = ['0-12m', '1-2y', '3-4y', '5-7y', '8+y'] as const;

// Allowed forward transitions — prevents invalid jumps (e.g. delivered → pending)
const ALLOWED_ORDER_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PRODUCT ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const adminProductService = {
  async getAll(): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name), product_images(id, image_url, display_order)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getById(id: string): Promise<AdminResult<any>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name), product_images(*), product_variants(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async create(productData: {
    name: string;
    slug: string;
    category_id: string;
    price: number;
    description?: string;
    compare_at_price?: number;
    sku?: string;
    stock_quantity?: number;
    age_group?: string;
    brand?: string;
    is_featured?: boolean;
    is_active?: boolean;
  }): Promise<AdminResult<any>> {
    try {
      await ensureAdmin();

      // Validate required fields
      if (!productData.name?.trim()) throw new Error('Product name is required');
      if (!productData.slug?.trim()) throw new Error('Product slug is required');
      if (!productData.category_id) throw new Error('Category is required');
      if (typeof productData.price !== 'number' || productData.price <= 0) {
        throw new Error('Price must be a positive number');
      }
      if (productData.age_group && !VALID_AGE_GROUPS.includes(productData.age_group as any)) {
        throw new Error('Invalid age group');
      }

      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          stock_quantity: productData.stock_quantity ?? 0,
          is_active: productData.is_active ?? true,
          is_featured: productData.is_featured ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async update(id: string, updates: Record<string, any>): Promise<AdminResult> {
    try {
      await ensureAdmin();
      if (!id) throw new Error('Product ID is required');

      // Sanitize: only allow known product fields
      const allowed = [
        'name', 'slug', 'description', 'price', 'compare_at_price', 'sku',
        'stock_quantity', 'age_group', 'brand', 'is_featured', 'is_active', 'category_id',
      ];
      const sanitized: Record<string, any> = {};
      for (const key of allowed) {
        if (key in updates) sanitized[key] = updates[key];
      }

      if (sanitized.price !== undefined && (typeof sanitized.price !== 'number' || sanitized.price < 0)) {
        throw new Error('Price must be a non-negative number');
      }
      if (sanitized.stock_quantity !== undefined && (typeof sanitized.stock_quantity !== 'number' || sanitized.stock_quantity < 0)) {
        throw new Error('Stock quantity must be a non-negative number');
      }

      const supabase: any = createAdminClient();

      const { error } = await supabase
        .from('products')
        .update(sanitized)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deactivate(id: string): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateStock(id: string, quantity: number): Promise<AdminResult> {
    try {
      await ensureAdmin();
      if (typeof quantity !== 'number' || quantity < 0) {
        throw new Error('Stock quantity must be a non-negative number');
      }

      const supabase: any = createAdminClient();

      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: quantity })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─── Image Management ────────────────────────────────────────────────────

  async addImage(productId: string, imageUrl: string, altText?: string, displayOrder?: number): Promise<AdminResult<any>> {
    try {
      await ensureAdmin();
      if (!imageUrl?.trim()) throw new Error('Image URL is required');

      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('product_images')
        .insert({ product_id: productId, image_url: imageUrl, alt_text: altText || null, display_order: displayOrder ?? 0 })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteImage(imageId: string): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async reorderImages(imageIds: { id: string; display_order: number }[]): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      for (const img of imageIds) {
        await supabase
          .from('product_images')
          .update({ display_order: img.display_order })
          .eq('id', img.id);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─── Variant Management ──────────────────────────────────────────────────

  async createVariant(productId: string, variant: {
    name: string;
    price: number;
    sku?: string;
    stock_quantity?: number;
    attributes?: Record<string, any>;
  }): Promise<AdminResult<any>> {
    try {
      await ensureAdmin();
      if (!variant.name?.trim()) throw new Error('Variant name is required');
      if (typeof variant.price !== 'number' || variant.price <= 0) {
        throw new Error('Variant price must be positive');
      }

      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          name: variant.name,
          price: variant.price,
          sku: variant.sku || null,
          stock_quantity: variant.stock_quantity ?? 0,
          attributes: variant.attributes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateVariant(variantId: string, updates: Record<string, any>): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const allowed = ['name', 'price', 'sku', 'stock_quantity', 'attributes'];
      const sanitized: Record<string, any> = {};
      for (const key of allowed) {
        if (key in updates) sanitized[key] = updates[key];
      }

      const supabase: any = createAdminClient();

      const { error } = await supabase
        .from('product_variants')
        .update(sanitized)
        .eq('id', variantId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteVariant(variantId: string): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  CATEGORY ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const adminCategoryService = {
  async getAll(): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async create(cat: { name: string; slug: string; description?: string; image_url?: string; is_active?: boolean }): Promise<AdminResult<any>> {
    try {
      await ensureAdmin();
      if (!cat.name?.trim()) throw new Error('Category name is required');
      if (!cat.slug?.trim()) throw new Error('Category slug is required');

      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('categories')
        .insert({ ...cat, is_active: cat.is_active ?? true })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async update(id: string, updates: Record<string, any>): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const allowed = ['name', 'slug', 'description', 'image_url', 'is_active'];
      const sanitized: Record<string, any> = {};
      for (const key of allowed) {
        if (key in updates) sanitized[key] = updates[key];
      }

      const supabase: any = createAdminClient();

      const { error } = await supabase
        .from('categories')
        .update(sanitized)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async delete(id: string): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      // Check if products use this category
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', id);

      if (count && count > 0) {
        throw new Error(`Cannot delete: ${count} products use this category. Reassign them first.`);
      }

      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ORDER ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const adminOrderService = {
  async getAll(page = 1, limit = 50): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { success: true, data: data || [], count: count ?? 0 };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getById(id: string): Promise<AdminResult<any>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Also fetch payment (exclude sensitive fields)
      const { data: payment } = await supabase
        .from('payments')
        .select('id, status, payment_method, amount, currency, created_at')
        .eq('order_id', id)
        .single();

      return { success: true, data: { ...data, payment } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateStatus(orderId: string, newStatus: string): Promise<AdminResult> {
    try {
      await ensureAdmin();

      if (!VALID_ORDER_STATUSES.includes(newStatus as any)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      const supabase: any = createAdminClient();

      // Fetch current status to validate transition
      const { data: order, error: fetchErr } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (fetchErr || !order) throw new Error('Order not found');

      const allowed = ALLOWED_ORDER_TRANSITIONS[order.status] || [];
      if (!allowed.includes(newStatus)) {
        throw new Error(`Cannot transition from "${order.status}" to "${newStatus}"`);
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updatePaymentStatus(orderId: string, newStatus: string): Promise<AdminResult> {
    try {
      await ensureAdmin();

      if (!VALID_PAYMENT_STATUSES.includes(newStatus as any)) {
        throw new Error(`Invalid payment status: ${newStatus}`);
      }

      const supabase: any = createAdminClient();

      await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', orderId);

      // Map to payment record status
      let paymentRecordStatus = newStatus;
      if (newStatus === 'paid') paymentRecordStatus = 'captured';

      await supabase
        .from('payments')
        .update({ status: paymentRecordStatus })
        .eq('order_id', orderId);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  CUSTOMER ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const adminCustomerService = {
  async getAll(): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getById(id: string): Promise<AdminResult<any>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch their orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, status, payment_status, total_amount, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      return { success: true, data: { ...profile, orders: orders || [] } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateRole(id: string, role: string): Promise<AdminResult> {
    try {
      await ensureAdmin();
      if (!['customer', 'admin'].includes(role)) {
        throw new Error('Invalid role. Must be "customer" or "admin".');
      }

      const supabase: any = createAdminClient();

      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  COUPON ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const adminCouponService = {
  async getAll(): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Table may not exist yet
        if (error.code === '42P01') return { success: true, data: [] };
        throw error;
      }
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message, data: [] };
    }
  },

  async create(coupon: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    is_active?: boolean;
  }): Promise<AdminResult<any>> {
    try {
      await ensureAdmin();
      if (!coupon.code?.trim()) throw new Error('Coupon code is required');
      if (!['percentage', 'fixed'].includes(coupon.discount_type)) {
        throw new Error('Discount type must be "percentage" or "fixed"');
      }
      if (typeof coupon.discount_value !== 'number' || coupon.discount_value <= 0) {
        throw new Error('Discount value must be positive');
      }
      if (coupon.discount_type === 'percentage' && coupon.discount_value > 100) {
        throw new Error('Percentage discount cannot exceed 100');
      }

      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('coupons')
        .insert({ ...coupon, code: coupon.code.toUpperCase(), is_active: coupon.is_active ?? true })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async toggleActive(id: string, isActive: boolean): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { error } = await supabase
        .from('coupons')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async delete(id: string): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { error } = await supabase.from('coupons').delete().eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  REVIEW ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const adminReviewService = {
  async getAll(): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async delete(id: string): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  INVENTORY ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const adminInventoryService = {
  async getLowStock(threshold = 10): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, sku, stock_quantity, price, is_active')
        .eq('is_active', true)
        .lt('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async bulkUpdateStock(updates: { id: string; stock_quantity: number }[]): Promise<AdminResult> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      for (const item of updates) {
        if (typeof item.stock_quantity !== 'number' || item.stock_quantity < 0) {
          throw new Error(`Invalid stock for product ${item.id}`);
        }
        const { error } = await supabase
          .from('products')
          .update({ stock_quantity: item.stock_quantity })
          .eq('id', item.id);
        if (error) throw error;
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ANALYTICS ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const adminAnalyticsService = {
  async getDashboardStats(): Promise<AdminResult<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    pendingOrders: number;
    lowStockCount: number;
    averageOrderValue: number;
  }>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      // Fetch paid orders for revenue
      const { data: paidOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');

      const totalRevenue = (paidOrders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

      // Count all orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });

      // Count customers
      const { count: totalCustomers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // Count active products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      // Count pending orders
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Count low stock
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .lt('stock_quantity', 10);

      const orderCount = totalOrders ?? 0;
      const averageOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

      return {
        success: true,
        data: {
          totalRevenue,
          totalOrders: orderCount,
          totalCustomers: totalCustomers ?? 0,
          totalProducts: totalProducts ?? 0,
          pendingOrders: pendingOrders ?? 0,
          lowStockCount: lowStockCount ?? 0,
          averageOrderValue,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getRecentOrders(limit = 10): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, payment_status, total_amount, shipping_address, created_at, order_items(product_name, quantity)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getRevenueByMonth(): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, payment_status')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });

      // Group by month
      const monthMap: Record<string, number> = {};
      for (const order of orders || []) {
        const d = new Date(order.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = (monthMap[key] || 0) + (order.total_amount || 0);
      }

      const result = Object.entries(monthMap).map(([month, revenue]) => ({ month, revenue }));
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getTopProducts(limit = 10): Promise<AdminResult<any[]>> {
    try {
      await ensureAdmin();
      const supabase: any = createAdminClient();

      const { data: items } = await supabase
        .from('order_items')
        .select('product_name, quantity');

      // Aggregate by product
      const productMap: Record<string, number> = {};
      for (const item of items || []) {
        productMap[item.product_name] = (productMap[item.product_name] || 0) + item.quantity;
      }

      const sorted = Object.entries(productMap)
        .map(([name, sold]) => ({ name, sold }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, limit);

      return { success: true, data: sorted };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
