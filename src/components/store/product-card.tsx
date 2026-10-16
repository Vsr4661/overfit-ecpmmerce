import Link from "next/link";
import { Badge, Price, ProductImage } from "@/components/ui";
import type { Product } from "@/types";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const soldOut = product.inventory <= 0;
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(min-width: 1024px) 25vw, 50vw"
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.imageBackUrl && (
          <ProductImage
            src={product.imageBackUrl}
            alt=""
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        {soldOut && (
          <Badge tone="ink" className="absolute left-3 top-3">
            Sold out
          </Badge>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{product.name}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {product.color ?? product.category}
            {product.sizes.length > 1 && ` · ${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}`}
          </p>
        </div>
        <Price amount={product.price} className="shrink-0 text-sm font-semibold" />
      </div>
    </Link>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </div>
  );
}
