"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";

export function CartIndicator() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="relative inline-flex items-center gap-1">
      <ShoppingCart className="h-4 w-4" />
      <span>Cart</span>
      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs text-white">
        {itemCount}
      </span>
    </Link>
  );
}
