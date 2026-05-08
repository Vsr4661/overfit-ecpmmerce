"use client";

import Link from "next/link";
import type { PrintroveProduct } from "@/lib/printrove-products";
import { printroveProductToCartProduct } from "@/lib/printrove-cart";
import { formatCurrency } from "@/lib/utils";
import { ProductImageGallery } from "@/components/store/ProductImageGallery";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import ProductCard from "@/components/ProductCard";

function formatPrice(p: PrintroveProduct): string {
  const x = p.price;
  if (x === undefined || x === null) return "—";
  if (typeof x === "number" && Number.isFinite(x)) return formatCurrency(x);
  const n = parseFloat(String(x).replace(/[^\d.-]/g, ""));
  if (Number.isFinite(n)) return formatCurrency(n);
  return String(x);
}

export function PrintroveProductDetailView({
  product,
  relatedProducts,
}: {
  product: PrintroveProduct;
  relatedProducts: PrintroveProduct[];
}) {
  const cartProduct = printroveProductToCartProduct(product);
  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [
          ...(product.imageFront ? [{ url: product.imageFront, label: "Front" }] : []),
          ...(product.imageBack && product.imageBack !== product.imageFront
            ? [{ url: product.imageBack, label: "Back" }]
            : []),
          ...(product.image && !product.imageFront && !product.imageBack
            ? [{ url: product.image, label: "Product" }]
            : []),
        ].filter((i) => i.url);

  const hasBack =
    !!product.imageBack &&
    !!product.imageFront &&
    product.imageBack !== product.imageFront;

  return (
    <div className="space-y-12">
      <nav className="text-sm text-zinc-500">
        <Link href="/shop" className="hover:text-zinc-900">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">{product.name}</span>
      </nav>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
        <ProductImageGallery items={gallery} productName={product.name || "Product"} />

        <div className="space-y-6">
          {product.catalogName && (
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{product.catalogName}</p>
          )}
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {product.name}
          </h1>

          {hasBack && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              This product includes <strong>front and back</strong> artwork — view all angles in the gallery.
            </p>
          )}

          <p className="text-3xl font-semibold text-zinc-900">{formatPrice(product)}</p>

          {(product.variantSize || product.variantColor) && (
            <div className="flex flex-wrap gap-2 text-sm text-zinc-700">
              {product.variantColor && (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                  Color: <strong>{product.variantColor}</strong>
                </span>
              )}
              {product.variantSize && (
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                  Size: <strong>{product.variantSize}</strong>
                </span>
              )}
            </div>
          )}

          <AddToCartButton
            product={cartProduct}
            size={product.variantSize || "M"}
            color={product.variantColor || "As shown"}
            quantity={1}
          />

          {product.sku && (
            <p className="text-xs text-zinc-500">
              SKU: <span className="font-mono text-zinc-700">{product.sku}</span>
            </p>
          )}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-900">More from the shop</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={String(item.id)} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
