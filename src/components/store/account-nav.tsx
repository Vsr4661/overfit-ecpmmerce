"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/store/sign-out-button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="flex items-center gap-6 border-b border-line md:flex-col md:items-stretch md:gap-1 md:border-b-0">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors md:mb-0 md:border-b-0 md:border-l-2 md:py-2 md:pl-4",
              active ? "border-ink text-ink" : "border-transparent text-ink/60 hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <div className="ml-auto md:ml-0 md:mt-6 md:pl-4">
        <SignOutButton />
      </div>
    </nav>
  );
}
