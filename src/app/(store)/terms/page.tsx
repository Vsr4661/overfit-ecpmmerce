import type { Metadata } from "next";
import Link from "next/link";
import { Detail, LegalName, LegalPage, Section, SupportEmail } from "@/components/legal";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Terms & conditions" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & conditions"
      intro={
        <>
          These terms are an agreement between you and <LegalName />, a{" "}
          <Detail value={BUSINESS.entityType} label="business type" /> registered at{" "}
          <Detail value={BUSINESS.address} label="registered address" />, which runs the {BUSINESS.brandName} website.
          By placing an order you agree to them.
        </>
      }
    >
      <Section title="Using this website">
        <p>
          You must be 18 or older to place an order, or be shopping with the involvement of a parent or guardian.
          The information you give us at checkout must be accurate. Please don&apos;t misuse the website, for example
          by attempting to access other people&apos;s orders or interfering with how it works.
        </p>
      </Section>

      <Section title="Our products">
        <p>
          Our products are printed to order. We try to show colours and prints accurately, but screens vary and
          printed colours can differ slightly from what you see. Small variations in print placement (a few
          millimetres) are a normal part of the printing process and are not considered defects. Measurements are
          approximate.
        </p>
      </Section>

      <Section title="Prices and payment">
        <p>
          All prices are in Indian Rupees and include GST. Shipping charges, if any, are shown before you pay.
          Payments are processed securely by Razorpay; we don&apos;t store your card, UPI or bank details.
        </p>
        <p>
          Discount codes can be used once per order, can&apos;t be exchanged for cash, and may have conditions such
          as a minimum order value or expiry date.
        </p>
      </Section>

      <Section title="Orders">
        <p>
          Your order is confirmed once your payment succeeds and you receive an order number. We may cancel an order
          and give you a full refund if an item is unavailable, a price was clearly listed in error, or we suspect
          fraud. If that happens, we&apos;ll let you know by email.
        </p>
      </Section>

      <Section title="Shipping, cancellations and returns">
        <p>
          Delivery is covered by our <Link href="/shipping">shipping policy</Link>, and cancellations, exchanges and
          refunds by our <Link href="/refunds">refund and exchange policy</Link>. Both form part of these terms.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The {BUSINESS.brandName} name, logo, designs, product photos and website content belong to us. You may not
          copy, reproduce or sell them without our written permission.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          To the extent the law allows, our total liability for any claim relating to an order is limited to the
          amount you paid for that order. We are not responsible for delays or failures caused by events outside our
          reasonable control, such as courier disruptions, natural disasters or strikes. Nothing in these terms
          limits your rights under the Consumer Protection Act, 2019.
        </p>
      </Section>

      <Section title="Governing law and disputes">
        <p>
          These terms are governed by the laws of India. If a dispute can&apos;t be resolved by contacting us first,
          it will be subject to the jurisdiction of the courts in{" "}
          <Detail value={BUSINESS.jurisdictionCity} label="jurisdiction city" />, without affecting your right to
          approach a consumer commission.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update these terms from time to time. The version on this page when you place an order is the one
          that applies to that order.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these terms? Email <SupportEmail /> or see our <Link href="/contact">contact page</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}
