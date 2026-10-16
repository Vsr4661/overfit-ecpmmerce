import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getSessionUser } from "@/lib/api-auth";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await getSessionUser();
  return (
    <CheckoutForm
      paymentsLive={isRazorpayConfigured()}
      signedInEmail={user?.role === "CUSTOMER" ? user.email : undefined}
    />
  );
}
