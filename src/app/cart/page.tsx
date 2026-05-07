"use client";

import Image from "next/image";
import Link from "next/link";
import { CartSummary } from "@/components/store/cart-summary";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">Your Cart</h1>
        {items.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <p className="text-zinc-600">Your cart is empty.</p>
            <Link href="/products" className="mt-4 inline-block text-sm font-medium underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-[96px_1fr_auto]"
              >
                <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-200">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-xs text-zinc-500">
                    Size: {item.size ?? "M"} | Color: {item.color ?? "Jet Black"}
                  </p>
                  <p className="text-sm text-zinc-500">{formatCurrency(item.product.price)} each</p>
                  <p className="text-sm font-medium text-zinc-800">
                    Subtotal: {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start">
                  <div className="flex items-center rounded-md border border-zinc-300">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-lg"
                    >
                      -
                    </button>
                    <span className="min-w-9 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-lg"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <div className="space-y-4">
        <CartSummary subtotal={subtotal} />
        <Link
          href="/checkout"
          className="block rounded-md bg-black px-4 py-2 text-center text-sm font-medium text-white"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
