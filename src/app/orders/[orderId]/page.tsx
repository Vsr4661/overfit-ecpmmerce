import { notFound } from "next/navigation";
import { OrderStatusTimeline } from "@/components/store/order-status-timeline";
import { getOrderById } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-500">Order Number</p>
        <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
        <p className="mt-2 text-sm text-zinc-600">Tracking ID: {order.id}</p>
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Shipment Timeline</h2>
        <OrderStatusTimeline status={order.status} />
      </section>

      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Items</h2>
        {order.items.map((item) => (
          <div key={item.product.id} className="flex items-center justify-between text-sm">
            <span>
              {item.product.name} x {item.quantity}
            </span>
            <span>{formatCurrency(item.product.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-zinc-200 pt-3 font-semibold">
          <span>Total Paid</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </section>
    </div>
  );
}
