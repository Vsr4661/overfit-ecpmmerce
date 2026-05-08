import type { PrintroveProduct } from "@/lib/printrove-products";
import type { Product } from "@/types";

/** Map a Printrove library item to the store `Product` shape for cart / checkout. */
export function printroveProductToCartProduct(p: PrintroveProduct): Product {
  const id = String(p.id ?? "");
  const rawPrice = p.price;
  const price =
    typeof rawPrice === "number" && Number.isFinite(rawPrice)
      ? rawPrice
      : parseFloat(String(rawPrice ?? "0").replace(/[^\d.-]/g, "")) || 0;

  const thumb =
    p.imageFront || p.image || p.gallery?.[0]?.url || p.images?.[0] || "";

  const descParts = [p.catalogName, p.title && p.name?.includes(String(p.title)) ? p.title : null].filter(
    Boolean,
  ) as string[];

  return {
    id,
    name: p.name || p.title || "Product",
    slug: `printrove-${id}`,
    description: descParts.length ? descParts.join(" · ") : "Printrove catalog item",
    price,
    imageUrl: thumb,
    category: p.catalogName || "Printrove",
    inventory: 999,
  };
}
