import type { Metadata } from "next";
import { ShopClient } from "@/components/store/shop-client";
import { getCategoriesWithCovers, getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: { category?: string } }) {
  const [products, categories] = await Promise.all([getProducts(), getCategoriesWithCovers()]);
  const initialCategory = categories.some((category) => category.slug === searchParams.category)
    ? searchParams.category!
    : "all";

  return (
    <ShopClient
      key={initialCategory}
      products={products}
      categories={categories.map(({ name, slug, count }) => ({ name, slug, count }))}
      initialCategory={initialCategory}
    />
  );
}
