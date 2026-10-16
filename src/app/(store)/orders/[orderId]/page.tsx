import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { OrderTimeline } from "@/components/store/order-timeline";
import { Price, ProductImage, buttonClasses } from "@/components/ui";
import { getSessionUser } from "@/lib/api-auth";
import { verifyOrderAccessToken } from "@/lib/auth";
import { getOrderView } from "@/lib/orders";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: { orderId: string };
  searchParams: { t?: string; placed?: string };
}) {
  const [hasToken, user] = await Promise.all([
    verifyOrderAccessToken(params.orderId, searchParams.t),
    getSessionUser(),
  ]);
  if (!hasToken && user?.role !== "ADMIN") {
    return (
      <div className="page flex min-h-[50vh] flex-col items-center justify-center gap-6 pt-10 text-center">
        <h1 className="display text-4xl">Link expired or invalid</h1>
        <p className="max-w-sm text-sm text-muted">Look up your order with your order number and email instead.</p>
        <Link href="/track" className={buttonClasses("primary", "lg")}>
          Track order
        </Link>
      </div>
    );
  }

  const order = await getOrderView(params.orderId);
  if (!order) notFound();

  return (
    <div className="page max-w-3xl pt-10">
      {searchParams.placed && order.status !== "PENDING" && (
        <div className="mb-10 flex items-start gap-3 bg-ink p-5 text-white">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="font-semibold">Thanks, {order.customerName.split(" ")[0]}. Your order is confirmed.</p>
            <p className="mt-1 text-sm text-white/70">
              Bookmark this page to check on it later, or look it up any time with your order number and email.
            </p>
          </div>
        </div>
      )}

      <p className="label">Order</p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">{order.orderNumber}</h1>
      <p className="mt-2 text-sm text-muted">Placed {formatDate(order.createdAt)}</p>

      <section className="mt-10">
        <OrderTimeline status={order.status} />
      </section>

      <section className="mt-12 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="label text-ink">Delivering to</h2>
          <p className="mt-3 text-sm leading-relaxed">
            {order.customerName}
            <br />
            {order.shippingAddress}
            <br />
            {order.customerPhone}
          </p>
        </div>
        <div>
          <h2 className="label text-ink">Contact</h2>
          <p className="mt-3 text-sm">{order.customerEmail}</p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="label text-ink">Items</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-surface">
                <ProductImage src={item.imageUrl} alt={item.productName} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <Link href={`/shop/${item.slug}`} className="font-medium hover:underline">
                  {item.productName}
                </Link>
                <p className="text-xs text-muted">
                  {[item.size && `Size ${item.size}`, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <Price amount={item.unitPrice * item.quantity} className="text-sm" />
            </li>
          ))}
        </ul>
        <dl className="ml-auto mt-4 max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd><Price amount={order.subtotal} /></dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{order.shippingFee === 0 ? "Free" : <Price amount={order.shippingFee} />}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-semibold">
            <dt>{order.paidAt ? "Paid" : "Total"}</dt>
            <dd><Price amount={order.total} /></dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
