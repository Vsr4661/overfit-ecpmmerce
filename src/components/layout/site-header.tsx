"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { cn, formatCurrency } from "@/lib/utils";

export type NavCategory = { name: string; slug: string };

export function SiteHeader({ categories }: { categories: NavCategory[] }) {
  const NAV = [
    { href: "/shop", label: "Shop all" },
    ...categories.slice(0, 3).map((category) => ({
      href: `/shop?category=${category.slug}`,
      label: category.name,
    })),
    { href: "/track", label: "Track order" },
  ];
  const { itemCount, hydrated } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="bg-ink py-2 text-center text-[11px] font-semibold uppercase tracking-label text-white">
        Free shipping over {formatCurrency(FREE_SHIPPING_THRESHOLD)} · 7-day exchanges
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="page flex h-16 items-center justify-between gap-4">
          <button
            type="button"
            className="-ml-2 p-2 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2" aria-label="Overfit home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/overfit.svg" alt="" width={28} height={28} className="h-7 w-7" />
            <span className="display text-xl">Overfit</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/70 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link href="/cart" className="relative -mr-2 flex items-center gap-2 p-2" aria-label={`Cart, ${itemCount} items`}>
            <ShoppingBag className="h-5 w-5" />
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center bg-accent px-1 text-[10px] font-bold text-white transition-opacity",
                hydrated && itemCount > 0 ? "opacity-100" : "opacity-0",
              )}
              aria-hidden
            >
              {itemCount}
            </span>
          </Link>
        </div>

        {open && (
          <nav
            aria-label="Mobile"
            className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper md:hidden"
          >
            <ul className="page divide-y divide-line">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="display block py-5 text-3xl">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
