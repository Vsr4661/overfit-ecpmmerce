"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { MAX_QUANTITY, useCart } from "@/components/providers/cart-provider";
import { Button, buttonClasses } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const hasSizes = product.sizes.length > 0;
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const maxQuantity = Math.max(1, Math.min(MAX_QUANTITY, product.inventory));
  const soldOut = product.inventory <= 0;

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 4000);
    return () => clearTimeout(timer);
  }, [added]);

  const handleAdd = () => {
    if (hasSizes && !size) {
      setSizeError(true);
      return;
    }
    addItem(product, { size: size ?? undefined, quantity });
    setAdded(true);
  };

  return (
    <div className="space-y-6">
      {hasSizes && (
        <fieldset>
          <div className="flex items-baseline justify-between">
            <legend className="label text-ink">Size{size && <span className="ml-2 text-muted">{size}</span>}</legend>
            <a href="#size-guide" className="text-xs text-muted underline underline-offset-4 hover:text-ink">
              Size guide
            </a>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={size === value}
                onClick={() => {
                  setSize(value);
                  setSizeError(false);
                }}
                className={cn(
                  "h-11 min-w-[3.25rem] border px-3 text-sm font-semibold transition-colors",
                  size === value ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          {sizeError && (
            <p className="mt-2 text-xs text-danger" role="alert">
              Choose a size first.
            </p>
          )}
        </fieldset>
      )}

      <div className="flex gap-3">
        <div className="flex h-14 items-center border border-line bg-surface">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="flex h-full w-11 items-center justify-center disabled:opacity-30"
            disabled={quantity <= 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite" aria-label={`Quantity ${quantity}`}>
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="flex h-full w-11 items-center justify-center disabled:opacity-30"
            disabled={quantity >= maxQuantity}
            onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button variant="accent" size="lg" className="flex-1" onClick={handleAdd} disabled={soldOut}>
          {soldOut ? "Sold out" : added ? (
            <>
              <Check className="h-4 w-4" /> Added
            </>
          ) : (
            "Add to cart"
          )}
        </Button>
      </div>

      <div aria-live="polite">
        {added && (
          <div className="flex items-center justify-between gap-3 border border-ink bg-surface p-3 text-sm">
            <span>
              Added {quantity} × {product.name}
              {size && ` (${size})`}
            </span>
            <Link href="/cart" className={buttonClasses("primary", "sm")}>
              View cart
            </Link>
          </div>
        )}
      </div>

      {!soldOut && product.inventory <= 5 && (
        <p className="text-xs font-semibold text-accent-ink">Only {product.inventory} left</p>
      )}
    </div>
  );
}
