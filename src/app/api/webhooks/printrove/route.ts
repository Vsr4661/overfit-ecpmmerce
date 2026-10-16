import { NextResponse } from "next/server";
import { setOrderStatus } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { verifyHmacSha256Hex } from "@/lib/hmac";

type PrintroveEvent = {
  event_id?: string;
  event?: string;
  data?: { order_id?: number | string; reference_number?: string; to_status?: string };
};

/**
 * Printrove order updates. Register in Printrove → Settings → Webhooks with events
 * order.shipped, order.delivered, order.cancelled and order.exception, and set
 * PRINTROVE_WEBHOOK_SECRET. Signature: hex HMAC-SHA256 of the raw body in X-Printrove-Signature.
 */
export async function POST(request: Request) {
  const secret = process.env.PRINTROVE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-printrove-signature");
  if (!signature || !verifyHmacSha256Hex(rawBody, signature, secret)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let event: PrintroveEvent;
  try {
    event = JSON.parse(rawBody) as PrintroveEvent;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  // Deliveries are at-least-once: skip events we've already handled.
  if (event.event_id) {
    const seen = await prisma.webhookEvent.findUnique({ where: { id: `printrove:${event.event_id}` } });
    if (seen) return NextResponse.json({ received: true, duplicate: true });
  }

  const printroveOrderId = event.data?.order_id != null ? String(event.data.order_id) : undefined;
  const reference = event.data?.reference_number;
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(printroveOrderId ? [{ printroveOrderId }] : []),
        ...(reference ? [{ orderNumber: reference }] : []),
      ],
    },
  });

  if (order) {
    switch (event.event) {
      case "order.shipped":
        await setOrderStatus(order.id, "SHIPPED", { forwardOnly: true });
        break;
      case "order.delivered":
        await setOrderStatus(order.id, "DELIVERED", { forwardOnly: true });
        break;
      case "order.cancelled":
      case "order.exception":
        // Paid orders need a human decision (refund / reship), so flag rather than auto-cancel.
        await prisma.order.update({
          where: { id: order.id },
          data: {
            fulfilmentError: `Printrove ${event.event.replace("order.", "")}${
              event.data?.to_status ? `: ${event.data.to_status}` : ""
            } — review in Printrove.`,
          },
        });
        break;
    }
  }

  if (event.event_id) {
    await prisma.webhookEvent.create({ data: { id: `printrove:${event.event_id}`, source: "printrove" } }).catch(() => {});
  }
  return NextResponse.json({ received: true });
}
