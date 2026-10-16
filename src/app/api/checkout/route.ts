import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/api-auth";
import { orderAccessToken } from "@/lib/auth";
import { rememberCheckoutDetails } from "@/lib/customers";
import { INDIAN_MOBILE, INDIAN_PIN } from "@/lib/india";
import { CheckoutError, createPendingOrder, markOrderPaid } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.string().trim().email().max(200),
  customerPhone: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE, "Enter a valid 10-digit Indian mobile number"),
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(INDIAN_PIN, "Enter a valid 6-digit PIN code"),
  country: z.literal("India"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
        size: z.string().max(10).optional(),
      }),
    )
    .min(1)
    .max(30),
  discountCode: z.string().trim().max(40).optional(),
});

export async function POST(request: Request) {
  let input: z.infer<typeof checkoutSchema>;
  try {
    input = checkoutSchema.parse(await request.json());
  } catch (error) {
    const message =
      error instanceof z.ZodError ? error.issues[0]?.message ?? "Invalid details" : "Invalid request";
    return NextResponse.json({ message }, { status: 400 });
  }

  const paymentsLive = isRazorpayConfigured();
  if (!paymentsLive && process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Payments are temporarily unavailable." }, { status: 503 });
  }

  let order;
  try {
    const user = await getSessionUser();
    const customerId = user?.role === "CUSTOMER" ? user.id : null;
    order = await createPendingOrder(input, customerId);
    if (customerId) {
      await rememberCheckoutDetails(customerId, {
        name: input.customerName,
        phone: input.customerPhone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
      });
    }
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    throw error;
  }

  const trackingUrl = `/orders/${order.id}?t=${await orderAccessToken(order.id)}`;

  if (!paymentsLive) {
    // Local development without Razorpay keys: treat the order as paid so the flow can be tested.
    await markOrderPaid(order.id, null);
    return NextResponse.json({ mode: "test", orderId: order.id, trackingUrl }, { status: 201 });
  }

  try {
    const razorpayOrder = await createRazorpayOrder(order.total, order.orderNumber);
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });
    return NextResponse.json(
      {
        mode: "razorpay",
        orderId: order.id,
        trackingUrl,
        razorpay: {
          keyId: process.env.RAZORPAY_KEY_ID,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[checkout] Razorpay order creation failed", error);
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return NextResponse.json(
      { message: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }
}
