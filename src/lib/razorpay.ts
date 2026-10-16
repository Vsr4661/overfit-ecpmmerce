import "server-only";
import Razorpay from "razorpay";
import { verifyHmacSha256Hex } from "@/lib/hmac";

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function client() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export async function createRazorpayOrder(amountInr: number, receipt: string) {
  return client().orders.create({
    amount: Math.round(amountInr * 100),
    currency: "INR",
    receipt,
    notes: { brand: "Overfit" },
  });
}

/** Checkout signature: HMAC_SHA256(`${order_id}|${payment_id}`, key_secret). */
export function verifyCheckoutSignature(razorpayOrderId: string, paymentId: string, signature: string) {
  return verifyHmacSha256Hex(`${razorpayOrderId}|${paymentId}`, signature, process.env.RAZORPAY_KEY_SECRET!);
}

export { verifyHmacSha256Hex as verifyWebhookSignature };
