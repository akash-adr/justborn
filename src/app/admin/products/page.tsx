import { requireAdmin } from '@/lib/auth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductsTable } from './ProductsTable'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const metadata = {
  title: 'Manage Products | Just Born Admin',
}

export default async function ProductsPage() {
  await requireAdmin()
  const supabase: any = createAdminClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(name), product_images(id, image_url)')
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('id, name').order('name', { ascending: true }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Toy Catalog</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage inventory, variants, prices, and showroom status.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#E63946] hover:bg-[#D62828] text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add New Toy
        </Link>
      </div>

      <ProductsTable products={products || []} categories={categories || []} />
    </div>
  )
}
