"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, Settings, ShoppingCart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="flex flex-col border-b border-white/10 bg-ink text-white lg:min-h-screen lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="display text-xl">
          Overfit
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-label text-white/50">Admin</span>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-3 px-3 py-2 text-sm transition-colors",
                active ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={logout}
          className="flex shrink-0 items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white lg:hidden"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </nav>
      <div className="mt-auto hidden border-t border-white/10 p-4 lg:block">
        <p className="truncate text-xs text-white/50">{email}</p>
        <button type="button" onClick={logout} className="mt-2 flex items-center gap-2 text-sm text-white/80 hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
