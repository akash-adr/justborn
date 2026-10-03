'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProductAction } from '../../actions'
import { slugify } from '@/lib/utils'
import { PlusCircle, Loader2, Image as ImageIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    tagline: '',
    price: '',
    compare_at_price: '',
    stock_quantity: '20',
    sku: '',
    brand: 'Just Born Heirloom',
    age_group: '0-12m',
    category_id: categories[0]?.id || '',
    image_url: '',
    is_active: true,
    is_featured: false,
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug === slugify(prev.name) || !prev.slug ? slugify(name) : prev.slug,
    }))
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Please provide a product name.')
      return
    }
    if (!formData.category_id) {
      setError('Please select a category.')
      return
    }
    const priceNum = parseFloat(formData.price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be greater than 0.')
      return
    }

    try {
      setLoading(true)
      const res = await createProductAction({
        name: formData.name,
        slug: formData.slug || slugify(formData.name),
        category_id: formData.category_id,
        price: priceNum,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : undefined,
        description: formData.description,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        sku: formData.sku || undefined,
        age_group: formData.age_group,
        brand: formData.brand,
        image_url: formData.image_url || undefined,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      })

      if (!res.success) {
        setError(res.error || 'Failed to create product.')
        setLoading(false)
        return
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">
          1. General Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Heirloom Rainbow Abacus"
              value={formData.name}
              onChange={handleNameChange}
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">URL Slug *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={handleChange}
              name="slug"
              placeholder="e.g. heirloom-rainbow-abacus"
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-mono focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-stone-700 mb-1.5">Short Tagline</label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. Handcrafted Beechwood Sensory Counting Frame"
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-stone-700 mb-1.5">Detailed Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe craftsmanship, Montessori developmental benefits, and materials..."
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-[#E63946]"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">
          2. Pricing & Inventory
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Selling Price (₹ INR) *</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 1499"
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-bold focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Compare Price (₹ MRP)</label>
            <input
              type="number"
              min="1"
              step="1"
              name="compare_at_price"
              value={formData.compare_at_price}
              onChange={handleChange}
              placeholder="e.g. 1999"
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Initial Stock Quantity *</label>
            <input
              type="number"
              required
              min="0"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-bold focus:outline-none focus:border-[#E63946]"
            />
          </div>
        </div>
      </div>

      {/* Categorization & Metadata */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-3">
          3. Taxonomy & Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Category *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-medium bg-white focus:outline-none focus:border-[#E63946]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Age Group</label>
            <select
              name="age_group"
              value={formData.age_group}
              onChange={handleChange}
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-medium bg-white focus:outline-none focus:border-[#E63946]"
            >
              <option value="0-12m">0-12 Months</option>
              <option value="1-2y">1-2 Years</option>
              <option value="3-4y">3-4 Years</option>
              <option value="5-7y">5-7 Years</option>
              <option value="8+y">8+ Years</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">SKU Code</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. JB-ABA-01"
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-mono focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-[#E63946]"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-stone-700 mb-1.5">Primary Image URL</label>
          <div className="relative">
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/... or hosted image URL"
              className="w-full rounded-2xl border border-stone-200 pl-10 pr-4 py-2.5 text-stone-900 font-medium text-xs focus:outline-none focus:border-[#E63946]"
            />
            <ImageIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            You can add further gallery images and variants immediately after creating the toy.
          </p>
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
            <span className="text-xs font-bold text-stone-800">Publish Immediately (Active)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded text-[#E63946] focus:ring-[#E63946]"
            />
            <span className="text-xs font-bold text-stone-800">Mark as Featured on Homepage</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#D62828] text-white font-bold py-3 px-8 rounded-full shadow-md transition disabled:opacity-50 text-xs"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
          {loading ? 'Creating...' : 'Create & Publish Toy'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold py-3 px-6 rounded-full transition text-xs"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
