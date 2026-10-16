import { AdminHeading } from "@/components/admin/admin-heading";
import { OrderTable } from "@/components/admin/order-table";
import { orderAccessToken } from "@/lib/auth";
import { isPrintroveConfigured } from "@/lib/printrove";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { items: true } } },
  });

  const rows = await Promise.all(
    orders.map(async (order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      city: order.city,
      total: order.total,
      status: order.status,
      itemCount: order._count.items,
      createdAt: order.createdAt.toISOString(),
      printroveOrderId: order.printroveOrderId,
      fulfilmentError: order.fulfilmentError,
      viewUrl: `/orders/${order.id}?t=${await orderAccessToken(order.id)}`,
    })),
  );

  return (
    <div>
      <AdminHeading title="Orders" />
      <OrderTable orders={rows} printroveConfigured={isPrintroveConfigured()} />
    </div>
  );
}
