import Link from "next/link";
import type { NavCategory } from "@/components/layout/site-header";

export function SiteFooter({ categories }: { categories: NavCategory[] }) {
  const COLUMNS = [
    {
      title: "Shop",
      links: [
        { href: "/shop", label: "All products" },
        ...categories.map((category) => ({ href: `/shop?category=${category.slug}`, label: category.name })),
      ],
    },
    {
      title: "Help",
      links: [
        { href: "/track", label: "Track your order" },
        { href: "/cart", label: "Your cart" },
        { href: "/shipping", label: "Shipping" },
        { href: "/refunds", label: "Refunds & exchanges" },
        { href: "/contact", label: "Contact us" },
        { href: "/about", label: "About" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy policy" },
        { href: "/terms", label: "Terms & conditions" },
      ],
    },
  ];

  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="page grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="display text-5xl sm:text-6xl">Overfit</p>
          <p className="max-w-sm text-sm text-white/60">
            Oversized essentials, designed in India and printed on demand. Less stock sitting in
            warehouses, more pieces made for someone.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="text-[11px] font-semibold uppercase tracking-label text-white/50">{column.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/80 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="page flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Overfit. All prices in INR, inclusive of GST.</p>
          <p>Payments secured by Razorpay</p>
        </div>
      </div>
    </footer>
  );
}
