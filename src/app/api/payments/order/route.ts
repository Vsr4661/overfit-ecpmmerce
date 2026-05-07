import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

const schema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  receipt: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ message: "Razorpay keys missing" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: Math.round(payload.amount * 100),
      currency: payload.currency,
      receipt: payload.receipt ?? `rcpt_${Date.now()}`,
      notes: { app: "overfit" },
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to create payment order" }, { status: 400 });
  }
}
