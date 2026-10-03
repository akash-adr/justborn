import { requireAdmin } from '@/lib/auth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NewProductForm } from './NewProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Create Product | Just Born Admin',
}

export default async function NewProductPage() {
  await requireAdmin()
  const supabase: any = createAdminClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-white border border-stone-200/80 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Create Heirloom Toy</h1>
          <p className="text-sm text-stone-500">Add a new Montessori-certified design to the Just Born store.</p>
        </div>
      </div>

      <NewProductForm categories={categories || []} />
    </div>
  )
}
