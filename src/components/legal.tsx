import Link from "next/link";
import type { ReactNode } from "react";
import { BUSINESS } from "@/lib/business";
import { formatDate } from "@/lib/utils";

/** Renders a business detail, or a highlighted placeholder if it hasn't been filled in yet. */
export function Detail({ value, label, href }: { value: string | null; label: string; href?: string }) {
  if (!value) {
    return (
      <mark className="bg-accent/15 px-1 font-semibold text-accent-ink" title="Fill this in src/lib/business.ts">
        [{label}]
      </mark>
    );
  }
  return href ? (
    <a href={href} className="underline underline-offset-4 hover:text-ink">
      {value}
    </a>
  ) : (
    <>{value}</>
  );
}

export const SupportEmail = () => (
  <Detail value={BUSINESS.supportEmail} label="support email" href={BUSINESS.supportEmail ? `mailto:${BUSINESS.supportEmail}` : undefined} />
);
export const LegalName = () => <Detail value={BUSINESS.legalName} label="legal business name" />;

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds & exchanges" },
  { href: "/shipping", label: "Shipping" },
  { href: "/contact", label: "Contact" },
];

export function LegalPage({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="page max-w-3xl pt-12">
      <p className="label">Last updated {formatDate(`${BUSINESS.policiesUpdated}T00:00:00+05:30`)}</p>
      <h1 className="display mt-3 text-4xl sm:text-6xl">{title}</h1>
      {intro && <p className="mt-6 text-lg text-ink/75">{intro}</p>}
      <div
        className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink/80 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-1.5 [&_a]:underline [&_a]:underline-offset-4"
      >
        {children}
      </div>
      <nav aria-label="Policies" className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm">
        {LEGAL_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="text-muted hover:text-ink">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
