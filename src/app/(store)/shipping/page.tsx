import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, SupportEmail } from "@/components/legal";
import { POLICY } from "@/lib/business";
import { FLAT_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Shipping & delivery" };

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping & delivery" intro="We ship everywhere in India. Here's what to expect after you order.">
      <Section title="Where we ship">
        <p>We deliver to addresses within India only. We don&apos;t ship internationally yet.</p>
      </Section>

      <Section title="Shipping charges">
        <ul>
          <li>
            <strong>Free</strong> on orders of {formatCurrency(FREE_SHIPPING_THRESHOLD)} or more (after any discount)
          </li>
          <li>{formatCurrency(FLAT_SHIPPING_FEE)} flat on smaller orders</li>
        </ul>
        <p>The exact amount is shown in your cart and at checkout before you pay.</p>
      </Section>

      <Section title="How long it takes">
        <ul>
          <li>
            <strong>Printing:</strong> your order is printed and dispatched within {POLICY.dispatchDays} business
            days.
          </li>
          <li>
            <strong>Delivery:</strong> {POLICY.deliveryDays} business days after dispatch for most of India. Remote
            areas and the North-East can take a few days longer.
          </li>
        </ul>
        <p>
          These are estimates. Festivals, weather and courier disruptions can occasionally cause delays; we&apos;ll
          let you know if your order is significantly late.
        </p>
      </Section>

      <Section title="Tracking your order">
        <p>
          You&apos;ll get an email when your order is confirmed and another when it ships. You can check its status
          any time on our <Link href="/track">order tracking page</Link> using your order number and email.
        </p>
      </Section>

      <Section title="Delivery problems">
        <ul>
          <li>Please double-check your address and phone number at checkout; couriers call before delivering.</li>
          <li>
            If a parcel is returned to us because the address was wrong or nobody was available after repeated
            attempts, we can re-send it, but you&apos;ll need to pay the shipping cost again.
          </li>
          <li>
            If your parcel looks tampered with or damaged when it arrives, take photos and email <SupportEmail />{" "}
            within 48 hours.
          </li>
        </ul>
      </Section>

      <Section title="Questions">
        <p>
          Email <SupportEmail /> with your order number, or see our <Link href="/contact">contact page</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
