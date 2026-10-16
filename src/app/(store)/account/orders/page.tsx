import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { Price, ProductImage, buttonClasses } from "@/components/ui";
import { getSessionUser } from "@/lib/api-auth";
import { orderAccessToken } from "@/lib/auth";
import { listCustomerOrders } from "@/lib/orders";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Your orders", robots: { index: false } };

export default async function AccountOrdersPage() {
  const user = await getSessionUser();
  if (user?.role !== "CUSTOMER") redirect("/login?next=/account/orders");

  const orders = await listCustomerOrders(user);
  const links = await Promise.all(orders.map(async (order) => `/orders/${order.id}?t=${await orderAccessToken(order.id)}`));

  return (
    <section>
      <h2 className="label text-ink">Orders</h2>

      {orders.length === 0 ? (
        <div className="mt-6 border border-line p-10 text-center">
          <p className="text-sm text-muted">No orders yet. Orders you place with {user.email} will show up here.</p>
          <Link href="/shop" className={`${buttonClasses("primary", "lg")} mt-6`}>
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {orders.map((order, index) => (
            <li key={order.id}>
              <Link href={links[index]} className="flex items-center gap-4 py-5 transition-colors hover:bg-surface">
                <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-surface">
                  {order.items[0] && <ProductImage src={order.items[0].imageUrl} alt="" sizes="56px" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 truncate text-sm text-muted">
                    {formatDate(order.createdAt)} ·{" "}
                    {order.items.map((item) => `${item.productName}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`).join(", ")}
                  </p>
                </div>
                <Price amount={order.total} className="text-sm font-semibold" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
