import { NextResponse } from "next/server";
import { z } from "zod";
import { markOrderPaid } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { isRazorpayConfigured, verifyCheckoutSignature } from "@/lib/razorpay";

const schema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/** Called by the browser after Razorpay Checkout succeeds. */
export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ message: "Payments are not configured." }, { status: 503 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Invalid payment payload" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (!order || order.razorpayOrderId !== body.razorpay_order_id) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  if (!verifyCheckoutSignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature)) {
    return NextResponse.json({ message: "Payment could not be verified" }, { status: 400 });
  }

  await markOrderPaid(order.id, body.razorpay_payment_id);
  return NextResponse.json({ ok: true });
}
