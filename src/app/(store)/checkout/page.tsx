import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutForm paymentsLive={isRazorpayConfigured()} />;
}
