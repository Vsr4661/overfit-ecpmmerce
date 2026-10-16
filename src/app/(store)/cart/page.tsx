"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { MAX_QUANTITY, useCart } from "@/components/providers/cart-provider";
import { OrderTotals } from "@/components/store/order-summary";
import { Price, ProductImage, buttonClasses } from "@/components/ui";

export default function CartPage() {
  const { items, hydrated, updateQuantity, removeItem, subtotal, itemCount } = useCart();

  if (!hydrated) {
    return <div className="page min-h-[50vh] pt-10" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="page flex min-h-[50vh] flex-col items-center justify-center gap-6 pt-10 text-center">
        <h1 className="display text-5xl">Your cart is empty</h1>
        <p className="text-sm text-muted">Nothing here yet. The new drop is a good place to start.</p>
        <Link href="/shop" className={buttonClasses("primary", "lg")}>
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="page pt-10">
      <h1 className="display text-5xl sm:text-6xl">
        Cart <span className="text-muted">({itemCount})</span>
      </h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-6">
              <Link href={`/shop/${item.slug}`} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-surface sm:w-32">
                <ProductImage src={item.imageUrl} alt={item.name} sizes="128px" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/shop/${item.slug}`} className="font-semibold hover:underline">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {[item.size && `Size ${item.size}`, item.color].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <Price amount={item.price * item.quantity} className="shrink-0 font-semibold" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 items-center border border-line bg-surface">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="flex h-full w-9 items-center justify-center"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      className="flex h-full w-9 items-center justify-center disabled:opacity-30"
                      disabled={item.quantity >= MAX_QUANTITY}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 text-xs text-muted hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-6 bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em]">Summary</h2>
          <OrderTotals subtotal={subtotal} />
          <Link href="/checkout" className={buttonClasses("accent", "lg") + " w-full"}>
            Checkout
          </Link>
          <Link href="/shop" className="block text-center text-xs text-muted underline underline-offset-4 hover:text-ink">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
