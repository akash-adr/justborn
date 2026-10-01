'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, Order } from '@/lib/types';
import { productService } from '@/lib/services/productService';
import { orderService } from '@/lib/services/orderService';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [prods, ords] = await Promise.all([
        productService.getProducts(),
        orderService.getOrders(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0) + 14850;
  const totalOrdersCount = orders.length + 128;
  const averageOrderValue = 84.5;

  return (
    <div className="min-h-screen py-10 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Supabase readiness banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase Service Layer Active • Mock Mode</span>
            </div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">
              Just Born Workshop Admin
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Store analytics, inventory control, and fulfillment tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/shop">
              <Button size="sm" variant="outline" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                View Customer Store
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-stone-200/80 pb-3">
          {(['overview', 'products', 'orders'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold px-4 py-2 rounded-2xl capitalize transition ${
                activeTab === tab
                  ? 'bg-[#26221F] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Sales</p>
              <h3 className="text-2xl font-black text-stone-900 mt-1">{formatPrice(totalRevenue)}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.4% this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Fulfilled Orders</p>
              <h3 className="text-2xl font-black text-stone-900 mt-1">{totalOrdersCount}</h3>
              <p className="text-[11px] text-stone-500 mt-1">100% on-time dispatch</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Average Basket</p>
              <h3 className="text-2xl font-black text-stone-900 mt-1">{formatPrice(averageOrderValue)}</h3>
              <p className="text-[11px] text-stone-500 mt-1">Above $75 free shipping target</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Catalog</p>
              <h3 className="text-2xl font-black text-stone-900 mt-1">{products.length} Designs</h3>
              <p className="text-[11px] text-stone-500 mt-1">FSC hardwood & linen</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2EE] text-[#E76F51] flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dynamic Tab Contents */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Orders Overview */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-stone-900">Recent Customer Orders</h3>
                <span className="text-xs text-stone-400">Live order queue</span>
              </div>

              <div className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <div key={order.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-stone-900">
                        Order #{order.orderNumber} • {order.shippingAddress.fullName}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {order.items.length} toys • {formatPrice(order.total)}
                      </p>
                    </div>

                    <span className="text-xs font-bold capitalize px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture / Supabase Status Box */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Backend Integration Architecture</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                The Just Born frontend implements a pure service architecture in{' '}
                <code className="text-[#E76F51] font-mono">src/lib/services/</code>.
              </p>
              <div className="space-y-2 text-xs text-stone-600">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 block font-mono text-[11px]">productService.ts</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Provides getProducts(), getProductBySlug(), getCategories()
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 block font-mono text-[11px]">orderService.ts</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Provides createOrder(), getOrders(), getOrderById()
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 block font-mono text-[11px]">authService.ts</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Provides login(), register(), updateProfile(), logout()
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Table Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm overflow-x-auto">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Toy Inventory Catalog</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase border-b border-stone-200">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Age Group</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock Count</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover border border-stone-200"
                      />
                      <span>{p.name}</span>
                    </td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3 font-mono">{p.ageGroup}</td>
                    <td className="p-3 font-bold text-stone-900">{formatPrice(p.price)}</td>
                    <td className="p-3">{p.stockCount} units</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        In Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm overflow-x-auto">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Store Orders Log</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-bold uppercase border-b border-stone-200">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Tracking</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="p-3 font-mono font-bold text-stone-900">{o.orderNumber}</td>
                    <td className="p-3 font-medium">{o.shippingAddress.fullName}</td>
                    <td className="p-3">{o.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}</td>
                    <td className="p-3 font-bold text-stone-900">{formatPrice(o.total)}</td>
                    <td className="p-3 font-mono text-stone-500">{o.trackingNumber || 'Pending'}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold capitalize text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
