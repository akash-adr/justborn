'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Layers, 
  Users, 
  Tag, 
  Star, 
  BarChart3,
  Menu,
  X,
  Store
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Layers },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-stone-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b border-stone-200">
              <span className="font-black text-xl text-stone-900">Just Born</span>
              <button onClick={() => setSidebarOpen(false)} className="text-stone-500 hover:text-stone-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                      active 
                        ? 'bg-red-50 text-[#E63946]' 
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:border-r lg:border-stone-200">
        <div className="flex h-16 items-center px-6 border-b border-stone-200">
          <span className="font-black text-xl text-stone-900">Just Born Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors ${
                  active 
                    ? 'bg-red-50 text-[#E63946]' 
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-stone-200 bg-white px-4 sm:px-6 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-stone-500 hover:text-stone-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 flex justify-between items-center">
            <h1 className="font-bold text-lg text-stone-900 lg:hidden">Just Born Admin</h1>
            <div className="hidden lg:block"></div>
            
            <Link 
              href="/shop"
              className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[#E63946] transition-colors"
            >
              <Store className="h-4 w-4" />
              View Store
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-stone-50">
          {children}
        </main>
      </div>
    </div>
  )
}
