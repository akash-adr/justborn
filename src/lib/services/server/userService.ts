import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  return data
}

export async function updateUserProfile(userId: string, updates: ProfileUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates as never)
    .eq('id', userId)
    
  return { data, error }
}
