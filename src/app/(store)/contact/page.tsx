import type { Metadata } from "next";
import Link from "next/link";
import { Detail, LegalName, LegalPage, Section, SupportEmail } from "@/components/legal";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  const whatsapp = process.env.WHATSAPP_NUMBER?.replace(/\D/g, "");
  const officer = BUSINESS.grievanceOfficer;
  return (
    <LegalPage
      title="Contact us"
      intro={
        <>
          Questions about an order, sizing or anything else? We reply within one business day. For order issues,
          you can also check your order&apos;s status on the <Link href="/track" className="underline underline-offset-4">tracking page</Link>.
        </>
      }
    >
      <Section title="Customer support">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
          <dt className="font-semibold text-ink">Email</dt>
          <dd>
            <SupportEmail />
          </dd>
          <dt className="font-semibold text-ink">Phone</dt>
          <dd>
            <Detail
              value={BUSINESS.supportPhone}
              label="support phone"
              href={BUSINESS.supportPhone ? `tel:${BUSINESS.supportPhone.replace(/\s/g, "")}` : undefined}
            />
          </dd>
          {whatsapp && (
            <>
              <dt className="font-semibold text-ink">WhatsApp</dt>
              <dd>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                  Chat with us
                </a>
              </dd>
            </>
          )}
          <dt className="font-semibold text-ink">Hours</dt>
          <dd>{BUSINESS.supportHours}</dd>
        </dl>
      </Section>

      <Section title="Business details">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
          <dt className="font-semibold text-ink">Legal name</dt>
          <dd>
            <LegalName />
          </dd>
          <dt className="font-semibold text-ink">Registered address</dt>
          <dd>
            <Detail value={BUSINESS.address} label="registered address" />
          </dd>
          {BUSINESS.gstin && (
            <>
              <dt className="font-semibold text-ink">GSTIN</dt>
              <dd className="font-mono">{BUSINESS.gstin}</dd>
            </>
          )}
        </dl>
      </Section>

      <Section title="Grievance Officer">
        <p>
          If we haven&apos;t resolved your complaint, you can escalate it to our Grievance Officer, appointed under the
          Consumer Protection (E-Commerce) Rules, 2020.
        </p>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[10rem_1fr]">
          <dt className="font-semibold text-ink">Name</dt>
          <dd>
            <Detail value={officer.name} label="grievance officer name" />
          </dd>
          <dt className="font-semibold text-ink">Email</dt>
          <dd>
            <Detail value={officer.email} label="grievance officer email" href={officer.email ? `mailto:${officer.email}` : undefined} />
          </dd>
        </dl>
        <p>We acknowledge complaints within 48 hours and aim to resolve them within one month.</p>
      </Section>
    </LegalPage>
  );
}
