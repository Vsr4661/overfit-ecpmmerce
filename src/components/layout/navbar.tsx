import Link from "next/link";
import { CartIndicator } from "@/components/store/cart-indicator";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-black">
          <img src="/overfit.svg" alt="Overfit logo" width={40} height={40} />
          <span className="font-bold text-black">OVERFIT</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-zinc-700">
          <Link href="/shop">Shop</Link>
          <Link href="/orders/ord_1">Track Order</Link>
          <Link href="/admin">Admin</Link>
          <CartIndicator />
        </nav>
      </div>
    </header>
  );
}
