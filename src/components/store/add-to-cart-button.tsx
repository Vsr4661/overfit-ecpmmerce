"use client";

import { useCart } from "@/components/providers/cart-provider";
import { Product } from "@/types";

export function AddToCartButton({
  product,
  size,
  color,
  quantity,
}: {
  product: Product;
  size?: string;
  color?: string;
  quantity?: number;
}) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() => addItem(product, { size, color, quantity })}
      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
    >
      Add to Cart
    </button>
  );
}
