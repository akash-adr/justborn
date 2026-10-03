import { requireAdmin } from '@/lib/auth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ProductEditor from './ProductEditor'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const resolvedParams = await params
  const supabase: any = createAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_variants(*)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (!product) {
    notFound()
  }

  const { data: categories } = await supabase.from('categories').select('id, name')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-black text-stone-900">Edit Product</h1>
      <ProductEditor product={product} categories={categories || []} />
    </div>
  )
}
