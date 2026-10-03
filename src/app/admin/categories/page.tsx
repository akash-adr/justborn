import { requireAdmin } from '@/lib/auth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CategoryManager } from './CategoryManager'

export const metadata = {
  title: 'Categories | Just Born Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const supabase: any = createAdminClient()

  // Fetch categories ordered by name
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  // Fetch products to count them per category
  const { data: products } = await supabase
    .from('products')
    .select('category_id')

  const productCounts = (products || []).reduce((acc: Record<string, number>, product: any) => {
    if (product.category_id) {
      acc[product.category_id] = (acc[product.category_id] || 0) + 1
    }
    return acc
  }, {})

  return (
    <CategoryManager
      categories={categories || []}
      productCounts={productCounts}
    />
  )
}
