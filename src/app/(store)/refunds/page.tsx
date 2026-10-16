import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, SupportEmail } from "@/components/legal";
import { POLICY } from "@/lib/business";

export const metadata: Metadata = { title: "Cancellations, refunds & exchanges" };

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refunds & exchanges"
      intro="Every piece is printed for you after you order, which shapes how cancellations and returns work. Here's exactly what we offer."
    >
      <Section title="Cancelling an order">
        <p>
          You can cancel within <strong>{POLICY.cancellationWindowHours} hours</strong> of placing your order, as long
          as it hasn&apos;t been sent to print. Email <SupportEmail /> with your order number and we&apos;ll refund
          you in full. Once printing has started, we can&apos;t cancel the order, but the exchange and defect
          policies below still apply.
        </p>
      </Section>

      <Section title="Wrong size? Exchange it">
        <p>
          If something doesn&apos;t fit, you can exchange it for a different size within{" "}
          <strong>{POLICY.exchangeWindowDays} days of delivery</strong>.
        </p>
        <ul>
          <li>The item must be unworn, unwashed and in its original condition.</li>
          <li>Each order can have one size exchange per item.</li>
          <li>You pay for sending the item back; we pay to ship the new size to you.</li>
          <li>Exchanges depend on the new size being available in the same design.</li>
        </ul>
      </Section>

      <Section title="Damaged, defective or wrong item">
        <p>
          If your order arrives damaged, misprinted, or isn&apos;t what you ordered, tell us within{" "}
          <strong>{POLICY.defectReportDays} days of delivery</strong>. Email <SupportEmail /> with your order number
          and clear photos of the problem. Once we&apos;ve confirmed it, you can choose a free replacement or a full
          refund, and we&apos;ll cover all shipping costs.
        </p>
      </Section>

      <Section title="What we can't accept">
        <ul>
          <li>Returns because you&apos;ve changed your mind (we&apos;re happy to exchange the size instead)</li>
          <li>Items that have been worn, washed or altered</li>
          <li>Requests made after the time limits above</li>
          <li>Small variations in colour or print placement, which are a normal part of printing</li>
        </ul>
      </Section>

      <Section title="How refunds are paid">
        <p>
          Approved refunds go back to your original payment method (UPI, card, netbanking or wallet) and usually
          reach you within <strong>{POLICY.refundDays} business days</strong>, depending on your bank. We&apos;ll
          email you when we&apos;ve issued it.
        </p>
      </Section>

      <Section title="Need help?">
        <p>
          Email <SupportEmail /> or see our <Link href="/contact">contact page</Link>. Have your order number ready;
          it starts with OVR- and is in your confirmation email.
        </p>
      </Section>
    </LegalPage>
  );
}
