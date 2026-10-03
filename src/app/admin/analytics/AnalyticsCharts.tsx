'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { IndianRupee, ShoppingBag, TrendingUp, Users } from 'lucide-react';

interface ChartData {
  revenueData: { name: string; total: number }[];
  statusData: { name: string; value: number }[];
  topProductsData: { name: string; quantity: number }[];
  trendData: { name: string; orders: number }[];
}

interface AnalyticsChartsProps {
  data: ChartData;
  stats: {
    totalRevenue: number;
    averageOrderValue: number;
    totalOrders: number;
    totalCustomers: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  delivered: '#059669', // emerald
  pending: '#D97706', // amber
  processing: '#4F46E5', // indigo
  shipped: '#4F46E5', // indigo
  cancelled: '#E63946', // red
  default: '#78716C', // stone
};

export default function AnalyticsCharts({ data, stats }: AnalyticsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500">Total Revenue</p>
              <p className="text-2xl font-black text-stone-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500">Avg Order Value</p>
              <p className="text-2xl font-black text-stone-900">{formatCurrency(stats.averageOrderValue)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500">Total Orders</p>
              <p className="text-2xl font-black text-stone-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-500">Total Customers</p>
              <p className="text-2xl font-black text-stone-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Over Time */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-black text-stone-900">Revenue Over Time</h2>
          <div className="h-80 w-full">
            {data.revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#78716C', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: '#F5F5F4' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Revenue']}
                  />
                  <Bar dataKey="total" fill="#E63946" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-stone-500">No revenue data available</div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-black text-stone-900">Order Status Distribution</h2>
          <div className="h-80 w-full">
            {data.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name.toLowerCase()] || STATUS_COLORS.default}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-stone-500">No order data available</div>
            )}
          </div>
        </div>

        {/* Sales Trend */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-black text-stone-900">Orders Trend</h2>
          <div className="h-80 w-full">
            {data.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#E63946"
                    strokeWidth={3}
                    dot={{ fill: '#E63946', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-stone-500">No trend data available</div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-black text-stone-900">Top Selling Products</h2>
          <div className="h-80 w-full">
            {data.topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.topProductsData}
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7E5E4" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#78716C', fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#78716C', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: '#F5F5F4' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="quantity" fill="#D97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-stone-500">No product data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
