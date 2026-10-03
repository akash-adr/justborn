'use client'

import { useState } from 'react'
import { createCouponAction, toggleCouponActiveAction, deleteCouponAction } from '../actions'
import { Plus, Tag, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface Coupon {
  id?: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  is_active: boolean
  description?: string
  is_static?: boolean
}

export function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newCoupon, setNewCoupon] = useState<{
    code: string
    discount_type: 'percentage' | 'fixed'
    discount_value: string
  }>({
    code: '',
    discount_type: 'percentage',
    discount_value: '10',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCoupon.code.trim()) return

    const val = parseFloat(newCoupon.discount_value)
    if (isNaN(val) || val <= 0) {
      alert('Discount value must be greater than 0')
      return
    }

    try {
      setLoading(true)
      const res = await createCouponAction({
        code: newCoupon.code.trim().toUpperCase(),
        discount_type: newCoupon.discount_type,
        discount_value: val,
        is_active: true,
      })

      if (res.success && res.data) {
        setCoupons((prev) => [res.data, ...prev])
        setNewCoupon({ code: '', discount_type: 'percentage', discount_value: '10' })
        setShowAddForm(false)
      } else {
        alert(res.error || 'Failed to create coupon')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (c: Coupon) => {
    if (!c.id) {
      alert('Default system promo codes cannot be disabled here.')
      return
    }

    try {
      const res = await toggleCouponActiveAction(c.id, !c.is_active)
      if (res.success) {
        setCoupons((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, is_active: !c.is_active } : item))
        )
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (c: Coupon) => {
    if (!c.id) {
      alert('Default fallback codes cannot be deleted.')
      return
    }
    if (!confirm(`Delete coupon ${c.code}?`)) return

    try {
      const res = await deleteCouponAction(c.id)
      if (res.success) {
        setCoupons((prev) => prev.filter((item) => item.id !== c.id))
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Coupons & Promotions</h1>
          <p className="text-sm text-stone-500 mt-1">
            Configure discount incentives, promo codes, and special holiday vouchers.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#D62828] text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> {showAddForm ? 'Close Form' : 'New Promo Code'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-black text-stone-900 border-b border-stone-100 pb-2">
            Add Promotional Voucher
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. FESTIVE25"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 font-mono text-stone-900 font-bold focus:outline-none focus:border-[#E63946]"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Discount Type</label>
              <select
                value={newCoupon.discount_type}
                onChange={(e) =>
                  setNewCoupon({
                    ...newCoupon,
                    discount_type: e.target.value as 'percentage' | 'fixed',
                  })
                }
                className="w-full border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-900 font-medium focus:outline-none focus:border-[#E63946]"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Fixed Rupee Off (₹)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Discount Value {newCoupon.discount_type === 'percentage' ? '(%)' : '(₹)'} *
              </label>
              <input
                type="number"
                required
                min="1"
                max={newCoupon.discount_type === 'percentage' ? 100 : undefined}
                value={newCoupon.discount_value}
                onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-[#E63946]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#E63946] text-white px-5 py-2 rounded-full font-bold text-xs hover:bg-[#D62828] transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Activate Coupon'}
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

      {/* Coupons Table */}
      <div className="bg-white border border-stone-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-400 font-bold uppercase text-[10px]">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount Structure</th>
                <th className="p-4">Savings Amount</th>
                <th className="p-4">System Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {coupons.map((coupon, idx) => {
                return (
                  <tr key={coupon.id || idx} className="hover:bg-stone-50/50 transition">
                    <td className="p-4 font-mono font-black text-stone-900 text-sm flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#E63946]" />
                      <span>{coupon.code}</span>
                    </td>

                    <td className="p-4 capitalize font-medium text-stone-800">
                      {coupon.discount_type === 'percentage' ? 'Percentage Deduction' : 'Flat Cash Voucher'}
                    </td>

                    <td className="p-4 font-black text-stone-900">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% OFF`
                        : `₹${coupon.discount_value} FLAT`}
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        {coupon.id ? 'Database' : 'Default Preset'}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(coupon)}
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border transition ${
                          coupon.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {coupon.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      {coupon.id && (
                        <button
                          type="button"
                          onClick={() => handleDelete(coupon)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}

              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    No active coupon codes found.
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
