import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

const payloadSchema = z.object({
  amount: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = payloadSchema.parse(body);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { message: "Razorpay keys are not configured." },
        { status: 500 },
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        brand: "Overfit",
      },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ message: "Unable to create Razorpay order" }, { status: 400 });
  }
}
