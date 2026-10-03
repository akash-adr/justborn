import { requireAdmin } from '@/lib/auth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { OrdersTable } from './OrdersTable'

export const metadata = {
  title: 'Manage Orders | Just Born Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  await requireAdmin()
  const supabase: any = createAdminClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Admin orders fetch error:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Customer Orders</h1>
        <p className="text-sm text-stone-500 mt-1">
          Monitor order fulfillment, inspect shipping destinations, and update package statuses.
        </p>
      </div>

      <OrdersTable orders={orders || []} />
    </div>
  )
}
