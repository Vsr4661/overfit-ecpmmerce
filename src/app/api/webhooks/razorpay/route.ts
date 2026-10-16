import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    order?: { entity?: { id?: string } };
  };
};

/**
 * Backup path for payment confirmation (e.g. the customer closed the tab before the
 * browser callback ran). Configure in Razorpay Dashboard → Webhooks with events
 * `payment.captured` and `order.paid`.
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();
  if (!signature || !verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ message: "Invalid webhook signature" }, { status: 401 });
  }

  let event: RazorpayWebhook;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    const razorpayOrderId = payment?.order_id ?? event.payload?.order?.entity?.id;
    if (razorpayOrderId) {
      const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
      if (order) await markOrderPaid(order.id, payment?.id ?? null);
    }
  }

  return NextResponse.json({ received: true });
}
