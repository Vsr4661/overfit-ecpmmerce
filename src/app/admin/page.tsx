import { AdminNav } from "@/components/admin/admin-nav";
import { KpiCard } from "@/components/admin/kpi-card";
import { getAdminAnalytics, getRecentOrders } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const analytics = getAdminAnalytics();
  const recentOrders = getRecentOrders();

  return (
    <div className="space-y-6">
      <AdminNav />
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Orders" value={String(analytics.totalOrders)} hint="All-time order count" />
        <KpiCard label="Revenue" value={analytics.revenueFormatted} hint="Total revenue received" />
        <KpiCard label="Total Products" value={String(analytics.totalProducts)} hint="Active catalog products" />
        <KpiCard
          label="Average Order Value"
          value={formatCurrency(
            analytics.totalOrders > 0 ? analytics.revenue / analytics.totalOrders : 0,
          )}
          hint="Revenue / orders"
        />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Recent Orders</h2>
        <div className="mt-3 space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-zinc-500">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p>{formatCurrency(order.total)}</p>
                <p className="text-zinc-500">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
