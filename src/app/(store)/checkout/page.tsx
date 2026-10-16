import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getSessionUser } from "@/lib/api-auth";
import { getCustomerProfile } from "@/lib/customers";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await getSessionUser();
  const profile = user?.role === "CUSTOMER" ? await getCustomerProfile(user.id) : null;
  return (
    <CheckoutForm
      paymentsLive={isRazorpayConfigured()}
      saved={
        profile && {
          customerName: profile.name,
          customerEmail: profile.email,
          customerPhone: profile.phone,
          addressLine1: profile.addressLine1,
          addressLine2: profile.addressLine2,
          city: profile.city,
          state: profile.state,
          postalCode: profile.postalCode,
        }
      }
    />
  );
}
