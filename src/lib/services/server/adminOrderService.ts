import { adminOrderService as service } from './adminService'

// Re-export secure adminOrderService which enforces database profiles.role = 'admin' and validated status transitions
export const adminOrderService = service
