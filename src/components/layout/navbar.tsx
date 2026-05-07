import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartIndicator } from "@/components/store/cart-indicator";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <ShoppingBag className="h-5 w-5" />
          OVERFIT
        </Link>
        <nav className="flex items-center gap-5 text-sm text-zinc-700">
          <Link href="/products">Shop</Link>
          <Link href="/orders/ord_1">Track Order</Link>
          <Link href="/admin">Admin</Link>
          <CartIndicator />
        </nav>
      </div>
    </header>
  );
}
