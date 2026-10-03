import { requireAdmin } from '@/lib/auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AnalyticsCharts from './AnalyticsCharts';

export const metadata = {
  title: 'Analytics | Just Born Admin',
};

export default async function AnalyticsPage() {
  await requireAdmin();
  const supabase: any = createAdminClient();

  // Fetch profiles count
  const { count: profilesCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at, payment_status')
    .order('created_at', { ascending: true });

  // Fetch order items for top products
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_name, quantity');

  const safeOrders = orders || [];
  const safeOrderItems = orderItems || [];

  // Stats calculations
  const totalOrders = safeOrders.length;
  const totalRevenue = safeOrders
    .filter((o: any) => o.payment_status === 'paid' || o.status === 'delivered')
    .reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
  
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue & Trend by Month
  const monthlyData: Record<string, { revenue: number; orders: number }> = {};
  
  safeOrders.forEach((order: any) => {
    const date = new Date(order.created_at);
    const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { revenue: 0, orders: 0 };
    }
    
    monthlyData[monthYear].orders += 1;
    
    if (order.payment_status === 'paid' || order.status === 'delivered') {
      monthlyData[monthYear].revenue += Number(order.total_amount) || 0;
    }
  });

  const revenueData = Object.entries(monthlyData).map(([name, data]) => ({
    name,
    total: data.revenue,
  }));

  const trendData = Object.entries(monthlyData).map(([name, data]) => ({
    name,
    orders: data.orders,
  }));

  // Status Distribution
  const statusCounts = safeOrders.reduce((acc: Record<string, number>, order: any) => {
    const status = order.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
  }));

  // Top Products
  const productCounts = safeOrderItems.reduce((acc: Record<string, number>, item: any) => {
    const name = item.product_name || 'Unknown Product';
    acc[name] = (acc[name] || 0) + (Number(item.quantity) || 0);
    return acc;
  }, {});

  const topProductsData = Object.entries(productCounts)
    .map(([name, quantity]) => ({ name, quantity: quantity as number }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5); // Top 5 products

  // Final structured data
  const chartData = {
    revenueData,
    statusData,
    topProductsData,
    trendData,
  };

  const stats = {
    totalRevenue,
    averageOrderValue,
    totalOrders,
    totalCustomers: profilesCount || 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-stone-900">Analytics Dashboard</h1>
        <p className="mt-2 text-stone-500 font-medium">
          Overview of your store&apos;s performance and sales trends.
        </p>
      </div>

      <AnalyticsCharts data={chartData} stats={stats} />
    </div>
  );
}
