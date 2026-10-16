import type { Metadata } from "next";
import { Detail, LegalName, LegalPage, Section, SupportEmail } from "@/components/legal";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  const officer = BUSINESS.grievanceOfficer;
  return (
    <LegalPage
      title="Privacy policy"
      intro={
        <>
          This policy explains what personal data <LegalName /> (&ldquo;{BUSINESS.brandName}&rdquo;, &ldquo;we&rdquo;)
          collects when you use this website, why, and the choices you have. It is written to comply with India&apos;s
          Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.
        </>
      }
    >
      <Section title="What we collect">
        <p>When you place an order, we collect:</p>
        <ul>
          <li>Your name, email address and mobile number</li>
          <li>Your delivery address</li>
          <li>What you ordered, how much you paid, and any discount code used</li>
          <li>A payment reference from Razorpay (not your card, UPI or bank details)</li>
        </ul>
        <p>
          We don&apos;t ask you to create an account. Your shopping cart is stored only in your own browser
          (local storage) until you check out.
        </p>
      </Section>

      <Section title="Why we use it">
        <ul>
          <li>To process your payment, print your order and deliver it</li>
          <li>To send order confirmations and shipping updates by email</li>
          <li>To contact you about a problem with your order</li>
          <li>To handle exchanges, refunds and complaints</li>
          <li>To meet our tax and accounting obligations</li>
        </ul>
        <p>
          You give us this data so we can fulfil your order, and we use it only for that. We do not send marketing
          messages unless you separately agree to receive them.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>We share only what each partner needs to do their job:</p>
        <ul>
          <li>
            <strong>Razorpay</strong> processes your payment. Card, UPI and bank details go directly to Razorpay and
            are never seen or stored by us.
          </li>
          <li>
            <strong>Printrove</strong> prints and ships your order, and receives your name, phone number and delivery
            address. Printrove passes these to its courier partners for delivery.
          </li>
          <li>
            <strong>Our email provider</strong> sends order emails on our behalf and receives your email address.
          </li>
          <li>
            <strong>Our hosting provider</strong> stores the website and its database.
          </li>
          <li>Government authorities, when the law requires it.</li>
        </ul>
        <p>We never sell your personal data.</p>
      </Section>

      <Section title="Cookies and tracking">
        <p>
          This website does not use advertising or analytics cookies. The only cookie we set is a sign-in cookie for
          our own staff when they use the admin area. Your cart is saved in your browser&apos;s local storage, which
          you can clear at any time through your browser settings.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep order records, including your name, contact details and address, for as long as Indian tax and
          accounting laws require us to. After that we delete or anonymise them.
        </p>
      </Section>

      <Section title="How we protect it">
        <p>
          Data is sent over encrypted connections (HTTPS), access to order data is limited to authorised staff, and
          payment data is handled entirely by Razorpay, a PCI-DSS compliant processor. No system is perfectly secure,
          but we take reasonable steps to protect your data and will notify you and the authorities of a breach as
          the law requires.
        </p>
      </Section>

      <Section title="Your rights">
        <p>Under the Digital Personal Data Protection Act, 2023, you can ask us to:</p>
        <ul>
          <li>Tell you what personal data we hold about you and how it has been used</li>
          <li>Correct or update inaccurate data</li>
          <li>Erase your data, except where the law requires us to keep it (for example, tax records)</li>
          <li>Nominate someone to exercise these rights on your behalf</li>
        </ul>
        <p>
          Email <SupportEmail /> to make a request. We may need to confirm your identity first. If you&apos;re not
          satisfied with our response, contact our Grievance Officer below. You also have the right to complain to the
          Data Protection Board of India.
        </p>
      </Section>

      <Section title="Children">
        <p>
          This website is intended for adults. If you are under 18, please shop with the involvement of a parent or
          guardian.
        </p>
      </Section>

      <Section title="Grievance Officer">
        <p>
          <Detail value={officer.name} label="grievance officer name" />
          <br />
          <Detail
            value={officer.email}
            label="grievance officer email"
            href={officer.email ? `mailto:${officer.email}` : undefined}
          />
          <br />
          <Detail value={BUSINESS.address} label="registered address" />
        </p>
        <p>We will acknowledge your complaint within 48 hours and aim to resolve it within one month.</p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we change this policy, we&apos;ll update it here and change the date at the top. Significant changes will
          be highlighted on the website.
        </p>
      </Section>
    </LegalPage>
  );
}
