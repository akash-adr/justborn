import { createClient } from '@/lib/supabase/server'

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*')
  
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  return data
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
    
  if (error) {
    console.error(`Error fetching category ${slug}:`, error)
    return null
  }
  return data
}
