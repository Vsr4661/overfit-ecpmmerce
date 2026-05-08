import Link from "next/link";
import { CartIndicator } from "@/components/store/cart-indicator";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex min-w-0 max-w-[55%] items-center gap-2 text-lg font-semibold text-black sm:max-w-none sm:gap-3"
        >
          <img
            src="/overfit.svg"
            alt="Overfit logo"
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
          />
          <span className="truncate font-bold text-black">OVERFIT</span>
        </Link>
        <nav className="flex max-w-[45%] flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm text-zinc-700 sm:max-w-none sm:gap-x-4 md:gap-x-5">
          <Link href="/shop" className="whitespace-nowrap hover:text-zinc-900">
            Shop
          </Link>
          <Link href="/products" className="whitespace-nowrap hover:text-zinc-900">
            Catalog
          </Link>
          <Link href="/orders/ord_1" className="whitespace-nowrap hover:text-zinc-900">
            Track Order
          </Link>
          <Link href="/admin" className="whitespace-nowrap hover:text-zinc-900">
            Admin
          </Link>
          <CartIndicator />
        </nav>
      </div>
    </header>
  );
}
