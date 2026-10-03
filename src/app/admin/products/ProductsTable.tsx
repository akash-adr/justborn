'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { toggleProductActiveAction, updateProductStockAction } from '../actions'
import { Edit, Star, Search, Filter, Check, Loader2, Package } from 'lucide-react'

interface ProductsTableProps {
  products: any[]
  categories: any[]
}

export function ProductsTable({ products: initialProducts, categories }: ProductsTableProps) {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL')
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null)
  const [stockInput, setStockInput] = useState<{ [id: string]: number }>({})

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
      const matchCategory = selectedCategory === 'ALL' || p.category_id === selectedCategory
      const matchStock =
        selectedStockStatus === 'ALL'
          ? true
          : selectedStockStatus === 'LOW'
          ? p.stock_quantity < 10
          : selectedStockStatus === 'OUT'
          ? p.stock_quantity === 0
          : p.stock_quantity >= 10

      return matchSearch && matchCategory && matchStock
    })
  }, [products, search, selectedCategory, selectedStockStatus])

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await toggleProductActiveAction(id, !currentActive)
      if (res.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, is_active: !currentActive } : item))
        )
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleQuickStockUpdate = async (id: string) => {
    const qty = stockInput[id]
    if (qty === undefined || qty < 0) return

    try {
      setUpdatingStockId(id)
      const res = await updateProductStockAction(id, qty)
      if (res.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === id ? { ...item, stock_quantity: qty } : item))
        )
        setStockInput((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUpdatingStockId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200/80 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search toy by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-stone-200 focus:outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-2xl border border-stone-200 px-3 py-1.5 bg-white text-stone-700 font-medium"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="rounded-2xl border border-stone-200 px-3 py-1.5 bg-white text-stone-700 font-medium"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW">Low Stock (&lt; 10)</option>
            <option value="OUT">Out of Stock (0)</option>
            <option value="HEALTHY">Healthy (10+)</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-400 uppercase text-[10px] font-bold">
                <th className="p-4">Toy Design</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Inventory</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((product) => {
                const img =
                  product.product_images?.[0]?.image_url ||
                  product.product_images?.[0]?.url ||
                  null
                const currentStock = product.stock_quantity ?? 0

                return (
                  <tr key={product.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {img ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={img}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400 shrink-0 border border-stone-200">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-extrabold text-stone-900 leading-snug truncate max-w-xs">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-400 font-mono">
                            <span>SKU: {product.sku || 'N/A'}</span>
                            {product.age_group && <span>• {product.age_group}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-medium text-stone-800">
                      {product.categories?.name || 'Uncategorized'}
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-stone-900">{formatPrice(product.price)}</span>
                      {product.compare_at_price ? (
                        <span className="block text-[10px] text-stone-400 line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      ) : null}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            currentStock === 0
                              ? 'bg-rose-100 text-rose-700'
                              : currentStock < 10
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {currentStock} in stock
                        </span>

                        {/* Inline quick stock update */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={stockInput[product.id] ?? ''}
                            onChange={(e) =>
                              setStockInput({
                                ...stockInput,
                                [product.id]: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-16 border border-stone-200 rounded-lg px-2 py-0.5 text-[11px] text-stone-800"
                          />
                          {stockInput[product.id] !== undefined && (
                            <button
                              type="button"
                              onClick={() => handleQuickStockUpdate(product.id)}
                              disabled={updatingStockId === product.id}
                              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                              title="Update stock"
                            >
                              {updatingStockId === product.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product.id, product.is_active)}
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border transition ${
                            product.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </button>
                        {product.is_featured && (
                          <span title="Featured in storefront">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#E63946] hover:text-red-700 transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    No products matched your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
