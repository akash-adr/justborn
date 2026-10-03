'use server'

import { assertAdmin } from '@/lib/auth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  adminProductService,
  adminOrderService,
  adminCategoryService,
  adminCouponService,
  adminReviewService,
  adminCustomerService,
  adminInventoryService,
} from '@/lib/services/server/adminService'
import { revalidatePath } from 'next/cache'

// ─── Products Actions ─────────────────────────────────────────────────────────

export async function createProductAction(data: {
  name: string
  slug: string
  category_id: string
  price: number
  compare_at_price?: number
  description?: string
  stock_quantity?: number
  sku?: string
  age_group?: string
  brand?: string
  is_active?: boolean
  is_featured?: boolean
  image_url?: string
}) {
  await assertAdmin()

  if (!data.name?.trim()) return { success: false, error: 'Product name is required.' }
  if (!data.slug?.trim()) return { success: false, error: 'Slug is required.' }
  if (!data.category_id) return { success: false, error: 'Category is required.' }
  if (typeof data.price !== 'number' || data.price <= 0) {
    return { success: false, error: 'Price must be greater than 0.' }
  }

  const result = await adminProductService.create({
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    category_id: data.category_id,
    price: data.price,
    compare_at_price: data.compare_at_price,
    description: data.description?.trim(),
    stock_quantity: Math.max(0, data.stock_quantity || 0),
    sku: data.sku?.trim(),
    age_group: data.age_group,
    brand: data.brand?.trim() || 'Just Born Heirloom',
    is_active: data.is_active ?? true,
    is_featured: data.is_featured ?? false,
  })

  if (!result.success || !result.data) {
    return { success: false, error: result.error || 'Failed to create product' }
  }

  // If initial image URL provided, attach it
  if (data.image_url?.trim()) {
    await adminProductService.addImage(result.data.id, data.image_url.trim(), data.name, 0)
  }

  revalidatePath('/admin/products')
  revalidatePath('/admin')
  revalidatePath('/shop')
  return { success: true, data: result.data }
}

export async function updateProductAction(id: string, data: Record<string, any>) {
  await assertAdmin()
  if (!id) return { success: false, error: 'Product ID is required.' }

  if (data.price !== undefined && (typeof data.price !== 'number' || data.price <= 0)) {
    return { success: false, error: 'Price must be greater than 0.' }
  }
  if (data.stock_quantity !== undefined && (typeof data.stock_quantity !== 'number' || data.stock_quantity < 0)) {
    return { success: false, error: 'Stock quantity cannot be negative.' }
  }

  const result = await adminProductService.update(id, data)
  if (result.success) {
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}`)
    revalidatePath('/admin')
    revalidatePath('/shop')
  }
  return result
}

export async function toggleProductActiveAction(id: string, isActive: boolean) {
  await assertAdmin()
  const result = await adminProductService.update(id, { is_active: isActive })
  if (result.success) {
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}`)
    revalidatePath('/admin')
    revalidatePath('/shop')
  }
  return result
}

export async function updateProductStockAction(id: string, quantity: number) {
  await assertAdmin()
  if (typeof quantity !== 'number' || quantity < 0) {
    return { success: false, error: 'Stock quantity must be non-negative.' }
  }
  const result = await adminProductService.updateStock(id, Math.floor(quantity))
  if (result.success) {
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}`)
    revalidatePath('/admin')
  }
  return result
}

export async function updateProductPriceAction(id: string, price: number, compareAtPrice?: number | null) {
  await assertAdmin()
  if (typeof price !== 'number' || price <= 0) {
    return { success: false, error: 'Price must be greater than 0.' }
  }
  const result = await adminProductService.update(id, {
    price,
    compare_at_price: compareAtPrice ?? null,
  })
  if (result.success) {
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${id}`)
    revalidatePath('/shop')
  }
  return result
}

export async function deleteProductAction(id: string) {
  await assertAdmin()
  // Soft deactivate product to preserve order history
  const result = await adminProductService.deactivate(id)
  if (result.success) {
    revalidatePath('/admin/products')
    revalidatePath('/admin')
    revalidatePath('/shop')
  }
  return result
}

// ─── Product Images Actions ───────────────────────────────────────────────────

export async function addProductImageAction(productId: string, imageUrl: string, altText?: string, displayOrder?: number) {
  await assertAdmin()
  if (!productId || !imageUrl?.trim()) {
    return { success: false, error: 'Product ID and valid image URL are required.' }
  }

  const result = await adminProductService.addImage(productId, imageUrl.trim(), altText, displayOrder)
  if (result.success) {
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath('/admin/products')
    revalidatePath('/shop')
  }
  return result
}

export async function deleteProductImageAction(imageId: string, productId: string) {
  await assertAdmin()
  const result = await adminProductService.deleteImage(imageId)
  if (result.success) {
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath('/admin/products')
  }
  return result
}

// ─── Product Variants Actions ─────────────────────────────────────────────────

export async function createVariantAction(productId: string, data: {
  name: string
  price: number
  sku?: string
  stock_quantity?: number
  attributes?: Record<string, any>
}) {
  await assertAdmin()
  if (!productId || !data.name?.trim()) {
    return { success: false, error: 'Product ID and variant name are required.' }
  }
  if (typeof data.price !== 'number' || data.price <= 0) {
    return { success: false, error: 'Variant price must be greater than 0.' }
  }

  const result = await adminProductService.createVariant(productId, data)
  if (result.success) {
    revalidatePath(`/admin/products/${productId}`)
  }
  return result
}

export async function updateVariantAction(variantId: string, productId: string, data: Record<string, any>) {
  await assertAdmin()
  const result = await adminProductService.updateVariant(variantId, data)
  if (result.success) {
    revalidatePath(`/admin/products/${productId}`)
  }
  return result
}

export async function deleteVariantAction(variantId: string, productId: string) {
  await assertAdmin()
  const result = await adminProductService.deleteVariant(variantId)
  if (result.success) {
    revalidatePath(`/admin/products/${productId}`)
  }
  return result
}

// ─── Orders Actions ───────────────────────────────────────────────────────────

export async function updateOrderStatusAction(orderId: string, status: string) {
  await assertAdmin()
  if (!orderId || !status) {
    return { success: false, error: 'Order ID and new status are required.' }
  }

  const result = await adminOrderService.updateStatus(orderId, status)
  if (result.success) {
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/admin')
    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)
  }
  return result
}

export async function updatePaymentStatusAction(orderId: string, paymentStatus: string) {
  await assertAdmin()
  if (!orderId || !paymentStatus) {
    return { success: false, error: 'Order ID and payment status are required.' }
  }

  const result = await adminOrderService.updatePaymentStatus(orderId, paymentStatus)
  if (result.success) {
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/admin')
    revalidatePath('/orders')
  }
  return result
}

// ─── Categories Actions ───────────────────────────────────────────────────────

export async function createCategoryAction(data: {
  name: string
  slug: string
  description?: string
  image_url?: string
  is_active?: boolean
}) {
  await assertAdmin()
  if (!data.name?.trim()) return { success: false, error: 'Category name is required.' }
  if (!data.slug?.trim()) return { success: false, error: 'Category slug is required.' }

  const result = await adminCategoryService.create({
    name: data.name.trim(),
    slug: data.slug.trim().toLowerCase(),
    description: data.description?.trim(),
    image_url: data.image_url?.trim(),
    is_active: data.is_active ?? true,
  })

  if (result.success) {
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
  }
  return result
}

export async function updateCategoryAction(id: string, data: Record<string, any>) {
  await assertAdmin()
  const result = await adminCategoryService.update(id, data)
  if (result.success) {
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
  }
  return result
}

export async function deleteCategoryAction(id: string) {
  await assertAdmin()
  const result = await adminCategoryService.delete(id)
  if (result.success) {
    revalidatePath('/admin/categories')
    revalidatePath('/shop')
  }
  return result
}

// ─── Coupons Actions ──────────────────────────────────────────────────────────

export async function createCouponAction(data: {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  is_active?: boolean
}) {
  await assertAdmin()
  if (!data.code?.trim()) return { success: false, error: 'Coupon code is required.' }
  if (!['percentage', 'fixed'].includes(data.discount_type)) {
    return { success: false, error: 'Discount type must be percentage or fixed.' }
  }
  if (typeof data.discount_value !== 'number' || data.discount_value <= 0) {
    return { success: false, error: 'Discount value must be greater than 0.' }
  }
  if (data.discount_type === 'percentage' && data.discount_value > 100) {
    return { success: false, error: 'Percentage discount cannot exceed 100%.' }
  }

  const result = await adminCouponService.create(data)
  if (result.success) {
    revalidatePath('/admin/coupons')
  }
  return result
}

export async function toggleCouponActiveAction(id: string, isActive: boolean) {
  await assertAdmin()
  const result = await adminCouponService.toggleActive(id, isActive)
  if (result.success) {
    revalidatePath('/admin/coupons')
  }
  return result
}

export async function deleteCouponAction(id: string) {
  await assertAdmin()
  const result = await adminCouponService.delete(id)
  if (result.success) {
    revalidatePath('/admin/coupons')
  }
  return result
}

// ─── Reviews Actions ──────────────────────────────────────────────────────────

export async function deleteReviewAction(id: string) {
  await assertAdmin()
  const result = await adminReviewService.delete(id)
  if (result.success) {
    revalidatePath('/admin/reviews')
    revalidatePath('/shop')
  }
  return result
}

// ─── Customers Actions ────────────────────────────────────────────────────────

export async function updateCustomerRoleAction(userId: string, role: string) {
  await assertAdmin()
  if (!['customer', 'admin'].includes(role)) {
    return { success: false, error: 'Role must be "customer" or "admin".' }
  }
  const result = await adminCustomerService.updateRole(userId, role)
  if (result.success) {
    revalidatePath('/admin/customers')
  }
  return result
}

// ─── Inventory Actions ────────────────────────────────────────────────────────

export async function bulkUpdateStockAction(updates: { id: string; stock_quantity: number }[]) {
  await assertAdmin()
  const result = await adminInventoryService.bulkUpdateStock(updates)
  if (result.success) {
    revalidatePath('/admin/products')
    revalidatePath('/admin')
  }
  return result
}
