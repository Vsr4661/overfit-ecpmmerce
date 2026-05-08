"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-80 w-full bg-gray-100 flex items-center justify-center">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={(e) => {
              // Hide the broken image and show a placeholder
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="flex items-center justify-center h-full bg-gray-200 text-gray-500">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                `;
              }
            }}
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</p>
        <Link href={`/products/${product.slug}`} className="block font-semibold">
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-700">₹{product.price.toFixed(2)}</p>
        </div>
      </div>
    </article>
  );
}