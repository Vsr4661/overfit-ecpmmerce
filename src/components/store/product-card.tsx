import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-80 w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</p>
        <Link href={`/products/${product.slug}`} className="block font-semibold">
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-700">{formatCurrency(product.price)}</p>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
