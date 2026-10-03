import { requireAdmin } from '@/lib/auth/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/utils'
import { Users, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react'

export const metadata = {
  title: 'Customers | Just Born Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  await requireAdmin()
  const supabase: any = createAdminClient()

  // Fetch profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('user_id, total_amount, status, payment_status')

  if (profilesError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Customer Accounts</h1>
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 text-rose-600 text-xs font-bold">
          Error loading customers: {profilesError.message}
        </div>
      </div>
    )
  }

  // Calculate order counts and total spent
  const customerStats = (orders || []).reduce(
    (acc: Record<string, { count: number; spent: number }>, order: any) => {
      if (order.user_id) {
        if (!acc[order.user_id]) {
          acc[order.user_id] = { count: 0, spent: 0 }
        }
        acc[order.user_id].count += 1
        if (order.payment_status === 'paid') {
          acc[order.user_id].spent += Number(order.total_amount) || 0
        }
      }
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Parent Accounts</h1>
          <p className="text-sm text-stone-500 mt-1">
            Registered family profiles, order engagement, and store roles.
          </p>
        </div>
        <div className="text-xs font-bold text-stone-600 bg-white border border-stone-200/80 px-4 py-2 rounded-full shadow-sm">
          Total Customers: <span className="text-[#E63946]">{profiles?.length || 0}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200/80 text-stone-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Total Settled</th>
                <th className="p-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {!profiles?.length ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-stone-400">
                    No registered customers found.
                  </td>
                </tr>
              ) : (
                profiles.map((profile: any) => {
                  const stats = customerStats[profile.id] || { count: 0, spent: 0 }
                  const isAdmin = profile.role === 'admin'

                  return (
                    <tr key={profile.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-600 uppercase text-xs">
                            {profile.full_name ? profile.full_name.substring(0, 2) : 'CU'}
                          </div>
                          <div>
                            <p className="font-extrabold text-stone-900">
                              {profile.full_name || 'Anonymous Parent'}
                            </p>
                            <p className="text-[10px] text-stone-400 font-mono">ID: {profile.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-stone-700">{profile.phone || 'Not provided'}</td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            isAdmin
                              ? 'bg-rose-50 text-[#E63946] border-rose-200'
                              : 'bg-stone-100 text-stone-600 border-stone-200'
                          }`}
                        >
                          {isAdmin ? 'Store Admin' : 'Customer'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-full text-[11px]">
                          {stats.count} {stats.count === 1 ? 'order' : 'orders'}
                        </span>
                      </td>

                      <td className="p-4 font-black text-stone-900">
                        {formatPrice(stats.spent)}
                      </td>

                      <td className="p-4 text-right text-stone-500 whitespace-nowrap">
                        {new Date(profile.created_at).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
