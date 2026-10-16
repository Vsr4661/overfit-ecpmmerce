import Link from "next/link";
import { AdminHeading } from "@/components/admin/admin-heading";
import { StatusBadge } from "@/components/admin/status-badge";
import { Price } from "@/components/ui";
import { listOrders } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const PAID_STATUSES = ["PAID", "PACKED", "SHIPPED", "DELIVERED"];

export default async function AdminDashboardPage() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [paid30, toFulfil, activeProducts, lowStock, failedFulfilment, recent] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: PAID_STATUSES }, paidAt: { gte: since } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.count({ where: { status: { in: ["PAID", "PACKED"] } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, inventory: { lte: 5 } } }),
    prisma.order.count({ where: { fulfilmentError: { not: null }, printroveOrderId: null } }),
    listOrders(8),
  ]);

  const revenue = paid30._sum.total ?? 0;
  const orderCount = paid30._count;

  const kpis = [
    { label: "Revenue · 30 days", value: formatCurrency(revenue) },
    { label: "Paid orders · 30 days", value: String(orderCount) },
    { label: "Avg. order value", value: formatCurrency(orderCount ? Math.round(revenue / orderCount) : 0) },
    { label: "To fulfil", value: String(toFulfil), href: "/admin/orders" },
  ];

  return (
    <div className="space-y-8">
      <AdminHeading title="Dashboard" />

      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface p-5">
            <p className="label">{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{kpi.value}</p>
          </div>
        ))}
      </div>

      {(failedFulfilment > 0 || lowStock > 0) && (
        <div className="space-y-2">
          {failedFulfilment > 0 && (
            <Link href="/admin/orders" className="block border border-danger bg-danger/5 p-3 text-sm text-danger">
              {failedFulfilment} paid {failedFulfilment === 1 ? "order" : "orders"} failed to send to Printrove. Review →
            </Link>
          )}
          {lowStock > 0 && (
            <Link href="/admin/products" className="block border border-accent bg-accent/10 p-3 text-sm">
              {lowStock} active {lowStock === 1 ? "product is" : "products are"} at 5 units or fewer. Review →
            </Link>
          )}
        </div>
      )}

      <section className="bg-surface">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs font-semibold underline underline-offset-4">
            All orders
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No orders yet. They&apos;ll appear here after checkout.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="truncate text-xs text-muted">
                    {order.customerName} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status as OrderStatus} />
                  <Price amount={order.total} className="w-20 text-right font-medium" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-muted">{activeProducts} active products in the catalog.</p>
    </div>
  );
}
