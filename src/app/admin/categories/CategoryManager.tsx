'use client'

import { useState } from 'react'
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '../actions'
import { Plus, Trash2, Edit2, Check, X, Loader2, Store } from 'lucide-react'
import { slugify } from '@/lib/utils'

interface CategoryManagerProps {
  categories: any[]
  productCounts: Record<string, number>
}

export function CategoryManager({ categories: initialCategories, productCounts }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
  })

  const handleNameChange = (name: string) => {
    setNewCategory((prev) => ({
      ...prev,
      name,
      slug: prev.slug === slugify(prev.name) || !prev.slug ? slugify(name) : prev.slug,
    }))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) return

    try {
      setLoading(true)
      const res = await createCategoryAction({
        name: newCategory.name,
        slug: newCategory.slug || slugify(newCategory.name),
        description: newCategory.description || undefined,
        image_url: newCategory.image_url || undefined,
        is_active: newCategory.is_active,
      })

      if (res.success && res.data) {
        setCategories((prev) => [...prev, res.data])
        setNewCategory({ name: '', slug: '', description: '', image_url: '', is_active: true })
        setShowAddForm(false)
      } else {
        alert(res.error || 'Failed to create category')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await updateCategoryAction(id, { is_active: !current })
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
        )
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    const count = productCounts[id] || 0
    if (count > 0) {
      alert(`Cannot delete "${name}" because ${count} products are currently assigned to it.`)
      return
    }
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return

    try {
      const res = await deleteCategoryAction(id)
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id))
      } else {
        alert(res.error || 'Failed to delete category')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleStartEdit = (cat: any) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditDescription(cat.description || '')
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await updateCategoryAction(id, {
        name: editName,
        description: editDescription,
      })
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name: editName, description: editDescription } : c))
        )
        setEditingId(null)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Catalog Categories</h1>
          <p className="text-sm text-stone-500 mt-1">
            Organize toys by developmental milestone and sensory themes.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#D62828] text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? 'Close Form' : 'New Category'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-stone-900 border-b border-stone-100 pb-2">
            Create Store Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Wooden Puzzles"
                value={newCategory.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Slug *</label>
              <input
                type="text"
                required
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={newCategory.image_url}
                onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block font-bold text-stone-700 mb-1">Short Description</label>
              <input
                type="text"
                placeholder="Montessori dexterity blocks and shape sorters"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-[#E63946]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#E63946] text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-[#D62828] transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-stone-100 text-stone-600 px-4 py-2 rounded-full font-bold text-xs hover:bg-stone-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-400 font-bold uppercase text-[10px]">
                <th className="p-4">Category</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Assigned Products</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {categories.map((cat) => {
                const count = productCounts[cat.id] || 0
                const isEditing = editingId === cat.id

                return (
                  <tr key={cat.id} className="hover:bg-stone-50/50 transition">
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-stone-300 rounded-lg px-2 py-1 text-xs font-bold text-stone-900"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          {cat.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                              <Store className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-extrabold text-stone-900">{cat.name}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-mono text-stone-500">{cat.slug}</td>

                    <td className="p-4 max-w-xs truncate text-stone-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full border border-stone-300 rounded-lg px-2 py-1 text-xs"
                        />
                      ) : (
                        cat.description || '-'
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-full text-[11px]">
                        {count} {count === 1 ? 'toy' : 'toys'}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat.id, cat.is_active)}
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border transition ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(cat.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-lg transition"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(cat)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    No categories configured yet.
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
