import { requireAdmin } from '@/lib/auth/server'
import { adminCouponService } from '@/lib/services/server/adminService'
import { VALID_PROMOS } from '@/lib/services/server/cartService'
import { CouponManager } from './CouponManager'

export const metadata = {
  title: 'Coupons & Vouchers | Just Born Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  await requireAdmin()

  const res = await adminCouponService.getAll()
  const dbCoupons = res.data || []

  // If no db coupons exist yet, map VALID_PROMOS as initial presets
  const presets = Object.entries(VALID_PROMOS).map(([code, p]) => ({
    code,
    discount_type: p.type,
    discount_value: p.value,
    is_active: true,
    description: p.description,
  }))

  const combinedCoupons = dbCoupons.length > 0 ? dbCoupons : presets

  return <CouponManager initialCoupons={combinedCoupons} />
}
