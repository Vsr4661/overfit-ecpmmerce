"use client";

import Link from "next/link";
import { useState } from "react";

export type ProductCardProduct = {
  id?: string | number;
  name?: string;
  title?: string;
  price?: number | string;
  image?: string;
  imageFront?: string;
  imageBack?: string;
  gallery?: { url: string; label: string }[];
  images?: string[];
  thumbnail?: string;
  mockup?: string;
  slug?: string;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80";

function formatRupee(price: number | string | undefined): string {
  if (price === undefined || price === null) return "—";
  if (typeof price === "number" && Number.isFinite(price)) {
    return price.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }
  const n = parseFloat(String(price).replace(/[^\d.-]/g, ""));
  if (Number.isFinite(n)) {
    return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }
  return String(price);
}

export default function ProductCard({
  product,
  href,
}: {
  product: ProductCardProduct;
  /** Detail URL; default `/shop/{id}` for Printrove library ids */
  href?: string;
}) {
  const front =
    product.imageFront ||
    product.image ||
    product.thumbnail ||
    product.mockup ||
    product.images?.[0] ||
    PLACEHOLDER_IMAGE;

  const back =
    product.imageBack && product.imageBack !== front ? product.imageBack : undefined;

  const [hover, setHover] = useState(false);
  const displaySrc = hover && back ? back : front;
  const multiView = !!back;
  const imageCount =
    product.gallery?.length ??
    (product.imageFront && product.imageBack && product.imageFront !== product.imageBack ? 2 : 1);

  const detailHref =
    href ?? (product.id != null ? `/shop/${encodeURIComponent(String(product.id))}` : undefined);

  const name = product.name || product.title || "Untitled Product";
  const priceLabel = formatRupee(product.price);

  const inner = (
    <>
      <div
        className="relative aspect-square w-full overflow-hidden bg-zinc-100"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img
          src={displaySrc}
          alt={name}
          className="h-full w-full object-cover transition-opacity duration-200"
        />
        {multiView && (
          <div className="pointer-events-none absolute left-2 top-2 flex flex-col gap-1">
            <span className="rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Front / Back
            </span>
            <span className="w-fit rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-medium text-zinc-800 shadow-sm">
              {imageCount} views
            </span>
          </div>
        )}
        {multiView && (
          <div className="pointer-events-none absolute bottom-2 right-2 hidden rounded-md bg-black/60 px-2 py-1 text-[10px] text-white sm:block">
            Hover for back
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-medium text-zinc-900 group-hover:text-zinc-700">{name}</h3>
        <p className="mt-2 text-sm text-zinc-600">₹{priceLabel}</p>
      </div>
    </>
  );

  const className =
    "group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md";

  if (detailHref) {
    return (
      <Link href={detailHref} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
