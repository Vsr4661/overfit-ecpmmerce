import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { SignOutButton } from "@/components/store/sign-out-button";
import { Price, ProductImage, buttonClasses } from "@/components/ui";
import { getSessionUser } from "@/lib/api-auth";
import { orderAccessToken } from "@/lib/auth";
import { listCustomerOrders } from "@/lib/orders";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage() {
  const user = await getSessionUser();
  if (user?.role === "ADMIN") redirect("/admin");
  if (!user) redirect("/login?next=/account");

  const orders = await listCustomerOrders(user);
  const links = await Promise.all(orders.map(async (order) => `/orders/${order.id}?t=${await orderAccessToken(order.id)}`));

  return (
    <div className="page max-w-3xl pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Signed in as {user.email}</p>
          <h1 className="display mt-2 text-5xl">Your orders</h1>
        </div>
        <SignOutButton />
      </div>

      {orders.length === 0 ? (
        <div className="mt-12 border border-line p-10 text-center">
          <p className="text-sm text-muted">No orders yet. Orders you place with {user.email} will show up here.</p>
          <Link href="/shop" className={`${buttonClasses("primary", "lg")} mt-6`}>
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
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
    </div>
  );
}
