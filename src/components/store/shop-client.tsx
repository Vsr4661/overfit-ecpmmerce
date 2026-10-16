"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { Button, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type SortOption = "newest" | "price-asc" | "price-desc";
type CategoryOption = { name: string; slug: string; count: number };

const PAGE_SIZE = 12;

export function ShopClient({
  products,
  categories,
  initialCategory,
}: {
  products: Product[];
  categories: CategoryOption[];
  initialCategory: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const allSizes = useMemo(() => {
    const seen = new Set<string>();
    for (const product of products) for (const value of product.sizes) seen.add(value);
    return [...seen];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = products.filter(
      (product) =>
        (category === "all" || product.categorySlug === category) &&
        (size === "all" || product.sizes.includes(size)) &&
        (!q || product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q)),
    );
    if (sort === "price-asc") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [products, category, size, query, sort]);

  const selectCategory = (slug: string) => {
    setCategory(slug);
    setVisible(PAGE_SIZE);
    const url = slug === "all" ? "/shop" : `/shop?category=${slug}`;
    window.history.replaceState(null, "", url);
  };

  const activeName = categories.find((c) => c.slug === category)?.name;
  const hasFilters = category !== "all" || size !== "all" || query !== "";

  return (
    <div className="page pt-10">
      <h1 className="display text-5xl sm:text-7xl">{activeName ?? "Shop all"}</h1>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Categories">
        {[{ name: "All", slug: "all", count: products.length }, ...categories].map((option) => (
          <button
            key={option.slug}
            type="button"
            role="tab"
            aria-selected={category === option.slug}
            onClick={() => selectCategory(option.slug)}
            className={cn(
              "shrink-0 border px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
              category === option.slug
                ? "border-ink bg-ink text-white"
                : "border-line bg-surface text-ink hover:border-ink",
            )}
          >
            {option.name} <span className="ml-1 opacity-50">{option.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 border-y border-line py-4 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            aria-label="Search products"
            placeholder="Search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="pl-9"
          />
        </div>
        {allSizes.length > 0 && (
          <Select
            aria-label="Filter by size"
            value={size}
            onChange={(event) => {
              setSize(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            className="sm:w-36"
          >
            <option value="all">All sizes</option>
            {allSizes.map((value) => (
              <option key={value} value={value}>
                Size {value}
              </option>
            ))}
          </Select>
        )}
        <Select
          aria-label="Sort products"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortOption)}
          className="sm:w-48"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </Select>
      </div>

      <div className="mb-6 mt-4 flex items-center justify-between text-xs text-muted">
        <p aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>
        {hasFilters && (
          <button
            type="button"
            className="font-semibold uppercase tracking-[0.08em] text-ink underline-offset-4 hover:underline"
            onClick={() => {
              selectCategory("all");
              setSize("all");
              setQuery("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <ProductGrid products={filtered.slice(0, visible)} priorityCount={4} />
      ) : (
        <div className="border border-dashed border-line p-16 text-center text-sm text-muted">
          Nothing matches those filters.
        </div>
      )}

      {visible < filtered.length && (
        <div className="mt-12 flex justify-center">
          <Button variant="secondary" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
