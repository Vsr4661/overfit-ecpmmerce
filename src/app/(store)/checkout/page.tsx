import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  const paymentsLive = isRazorpayConfigured();
  // Matches /api/checkout: without Razorpay keys, test orders are only allowed outside production.
  const testMode = !paymentsLive && process.env.NODE_ENV !== "production";
  return <CheckoutForm paymentsLive={paymentsLive} testMode={testMode} />;
}
