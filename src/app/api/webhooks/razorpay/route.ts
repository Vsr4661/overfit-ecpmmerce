import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

function verifySignature(payload: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  const rawBody = await request.text();

  if (!signature || !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ message: "Invalid webhook signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as { event?: string; payload?: unknown };

  return NextResponse.json({
    message: "Webhook received",
    event: event.event ?? "unknown",
  });
}
