'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateProductAction,
  deleteProductAction,
  addProductImageAction,
  deleteProductImageAction,
  createVariantAction,
  updateVariantAction,
  deleteVariantAction,
} from '../../actions'
import {
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
} from 'lucide-react'
import Link from 'next/link'

export default function ProductEditor({
  product,
  categories,
}: {
  product: any
  categories: any[]
}) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    tagline: product.tagline || '',
    price: product.price || 0,
    compare_at_price: product.compare_at_price || 0,
    stock_quantity: product.stock_quantity ?? 0,
    age_group: product.age_group || '0-12m',
    brand: product.brand || 'Just Born Heirloom',
    sku: product.sku || '',
    category_id: product.category_id || '',
    is_active: product.is_active ?? true,
    is_featured: product.is_featured ?? false,
  })

  // Images state
  const [images, setImages] = useState(product.product_images || [])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [addingImage, setAddingImage] = useState(false)

  // Variants state
  const [variants, setVariants] = useState(product.product_variants || [])
  const [newVariant, setNewVariant] = useState({ name: '', price: product.price || 999, stock_quantity: 10, sku: '' })
  const [showAddVariant, setShowAddVariant] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const val =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
        ? parseFloat(value) || 0
        : value
    setFormData((prev) => ({ ...prev, [name]: val }))
  }

  const handleVariantFieldChange = (index: number, field: string, value: any) => {
    const next = [...variants]
    next[index] = { ...next[index], [field]: value }
    setVariants(next)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setStatusMessage(null)

      const res = await updateProductAction(product.id, formData)
      if (!res.success) {
        throw new Error(res.error || 'Failed to update product')
      }

      // Sync variants
      for (const variant of variants) {
        if (variant.id) {
          await updateVariantAction(variant.id, product.id, {
            name: variant.name,
            price: variant.price,
            stock_quantity: variant.stock_quantity,
            sku: variant.sku,
          })
        }
      }

      setStatusMessage({ type: 'success', text: 'Product updated successfully.' })
      router.refresh()
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.message || 'Save failed.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newImageUrl.trim()) return

    try {
      setAddingImage(true)
      const res = await addProductImageAction(product.id, newImageUrl.trim(), product.name, images.length)
      if (res.success && res.data) {
        setImages((prev: any[]) => [...prev, res.data])
        setNewImageUrl('')
        setStatusMessage({ type: 'success', text: 'Image added.' })
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to add image.' })
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message })
    } finally {
      setAddingImage(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Remove this product photo?')) return
    try {
      const res = await deleteProductImageAction(imageId, product.id)
      if (res.success) {
        setImages((prev: any[]) => prev.filter((img: any) => img.id !== imageId))
        setStatusMessage({ type: 'success', text: 'Image removed.' })
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message })
    }
  }

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newVariant.name.trim()) return

    try {
      const res = await createVariantAction(product.id, {
        name: newVariant.name,
        price: Number(newVariant.price) || formData.price,
        stock_quantity: Number(newVariant.stock_quantity) || 0,
        sku: newVariant.sku || undefined,
      })
      if (res.success && res.data) {
        setVariants((prev: any[]) => [...prev, res.data])
        setNewVariant({ name: '', price: formData.price, stock_quantity: 10, sku: '' })
        setShowAddVariant(false)
        setStatusMessage({ type: 'success', text: 'Variant created.' })
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to create variant.' })
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message })
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Delete this variant?')) return
    try {
      const res = await deleteVariantAction(variantId, product.id)
      if (res.success) {
        setVariants((prev: any[]) => prev.filter((v: any) => v.id !== variantId))
        setStatusMessage({ type: 'success', text: 'Variant removed.' })
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message })
    }
  }

  const handleDeactivate = async () => {
    const actionText = formData.is_active ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${actionText} this product?`)) return
    try {
      const nextActive = !formData.is_active
      await updateProductAction(product.id, { is_active: nextActive })
      setFormData((prev) => ({ ...prev, is_active: nextActive }))
      setStatusMessage({ type: 'success', text: `Product ${nextActive ? 'activated' : 'deactivated'}.` })
      router.refresh()
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-lg font-black text-stone-900">1. Basic Information</h2>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              formData.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
            }`}
          >
            {formData.is_active ? 'Active in Shop' : 'Deactivated / Draft'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Product Title</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">URL Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 font-mono text-stone-800 focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-stone-700 mb-1">Short Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 text-stone-800 focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-stone-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 text-stone-800 focus:outline-none focus:border-[#E63946]"
            />
          </div>
        </div>
      </div>

      {/* 2. Pricing & Stock */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">
          2. Pricing & Stock Control
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Selling Price (₹ INR)</label>
            <input
              type="number"
              min="1"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Compare at Price (₹ MRP)</label>
            <input
              type="number"
              min="0"
              name="compare_at_price"
              value={formData.compare_at_price || ''}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 text-stone-700 focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Available Stock Units</label>
            <input
              type="number"
              min="0"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 font-bold text-stone-900 focus:outline-none focus:border-[#E63946]"
            />
          </div>
        </div>
      </div>

      {/* 3. Taxonomy */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">
          3. Taxonomy & Visibility
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 bg-white text-stone-900 focus:outline-none focus:border-[#E63946]"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Age Recommendation</label>
            <select
              name="age_group"
              value={formData.age_group}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 bg-white text-stone-900 focus:outline-none focus:border-[#E63946]"
            >
              <option value="0-12m">0-12 Months</option>
              <option value="1-2y">1-2 Years</option>
              <option value="3-4y">3-4 Years</option>
              <option value="5-7y">5-7 Years</option>
              <option value="8+y">8+ Years</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 font-mono text-stone-800 focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full border border-stone-200 rounded-2xl px-4 py-2.5 text-stone-800 focus:outline-none focus:border-[#E63946]"
            />
          </div>
        </div>

        <div className="flex items-center gap-8 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946]"
            />
            <span className="text-xs font-bold text-stone-800">Active (Visible in Store)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946]"
            />
            <span className="text-xs font-bold text-stone-800">Featured in Showcase</span>
          </label>
        </div>
      </div>

      {/* 4. Product Gallery Images */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-lg font-black text-stone-900">4. Gallery Images</h2>
          <span className="text-xs text-stone-400">{images.length} photos</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {images.map((img: any) => {
            const src = img.image_url || img.url
            return (
              <div
                key={img.id}
                className="relative group aspect-square rounded-2xl border border-stone-200 overflow-hidden bg-stone-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={img.alt_text || 'Product image'} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-rose-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Add Image URL Form */}
        <form onSubmit={handleAddImage} className="pt-2 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="url"
              placeholder="Paste new image URL (e.g. Unsplash, Supabase Storage, CDN)..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full border border-stone-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#E63946]"
            />
            <ImageIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>
          <button
            type="submit"
            disabled={addingImage || !newImageUrl.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-2xl hover:bg-stone-800 disabled:opacity-50 transition"
          >
            {addingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add Image
          </button>
        </form>
      </div>

      {/* 5. Product Variants */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-stone-900">5. Product Variants</h2>
            <p className="text-xs text-stone-500">Manage size, wood type, or color variants</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddVariant(!showAddVariant)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" /> {showAddVariant ? 'Cancel' : 'Add Variant'}
          </button>
        </div>

        {showAddVariant && (
          <form onSubmit={handleCreateVariant} className="p-4 rounded-2xl bg-red-50/50 border border-red-200/60 space-y-3">
            <p className="text-xs font-black text-[#E63946]">New Variant Specification</p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Variant Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Natural Maple (Large)"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3 py-1.5 bg-white text-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={newVariant.price}
                  onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-stone-200 px-3 py-1.5 bg-white text-stone-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Stock Units</label>
                <input
                  type="number"
                  required
                  value={newVariant.stock_quantity}
                  onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-stone-200 px-3 py-1.5 bg-white text-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">SKU</label>
                <input
                  type="text"
                  placeholder="e.g. JB-VAR-01"
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 px-3 py-1.5 bg-white text-stone-900 font-mono"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#E63946] text-white text-xs font-bold hover:bg-[#D62828] transition"
            >
              Save Variant
            </button>
          </form>
        )}

        {variants.length === 0 ? (
          <p className="text-xs text-stone-400 py-3 text-center">
            No variants configured. The primary product price and stock will apply.
          </p>
        ) : (
          <div className="space-y-3">
            {variants.map((v: any, idx: number) => (
              <div
                key={v.id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase">Name</span>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => handleVariantFieldChange(idx, 'name', e.target.value)}
                      className="w-full border border-stone-200 rounded-xl px-2.5 py-1 bg-white font-medium text-stone-900"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase">Price (₹)</span>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleVariantFieldChange(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full border border-stone-200 rounded-xl px-2.5 py-1 bg-white font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase">Stock</span>
                    <input
                      type="number"
                      value={v.stock_quantity}
                      onChange={(e) => handleVariantFieldChange(idx, 'stock_quantity', parseInt(e.target.value) || 0)}
                      className="w-full border border-stone-200 rounded-xl px-2.5 py-1 bg-white font-medium text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteVariant(v.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-stone-200/60 transition"
                    title="Delete variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Actions Bottom Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#D62828] text-white font-bold py-3 px-8 rounded-full shadow-md transition disabled:opacity-50 text-xs"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving Changes...' : 'Save Product Changes'}
          </button>
          <Link
            href="/admin/products"
            className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold py-3 px-6 rounded-full transition text-xs"
          >
            Cancel
          </Link>
        </div>

        <button
          type="button"
          onClick={handleDeactivate}
          className={`text-xs font-bold px-4 py-2.5 rounded-full border transition ${
            formData.is_active
              ? 'border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
              : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          {formData.is_active ? 'Deactivate from Catalog' : 'Reactivate in Catalog'}
        </button>
      </div>
    </div>
  )
}
