"use client";

import { useMemo, useState } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/store/product-card";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"] as const;
const PAGE_SIZE = 6;

function getProductSizes(index: number) {
  const basePatterns = [
    ["S", "M", "L"],
    ["M", "L", "XL"],
    ["XS", "S", "M"],
    ["S", "M", "L", "XL"],
    ["M", "L"],
  ];

  return basePatterns[index % basePatterns.length] as string[];
}

type SortOption = "newest" | "price-asc" | "price-desc";

export function ShopClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const min = priceMin ? Number(priceMin) : 0;
    const max = priceMax ? Number(priceMax) : Number.POSITIVE_INFINITY;
    const lowerQuery = query.trim().toLowerCase();

    const withIndex = products.map((product, index) => ({ product, index }));

    const filtered = withIndex.filter(({ product, index }) => {
      const inQuery =
        lowerQuery.length === 0 ||
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery);
      const inCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const inPrice = product.price >= min && product.price <= max;
      const sizes = getProductSizes(index);
      const inSize = selectedSize === "All" || sizes.includes(selectedSize);

      return inQuery && inCategory && inPrice && inSize;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") return a.product.price - b.product.price;
      if (sortBy === "price-desc") return b.product.price - a.product.price;
      return a.index - b.index;
    });

    return sorted.map((entry) => entry.product);
  }, [priceMax, priceMin, products, query, selectedCategory, selectedSize, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Shop All Products</h1>
        <p className="text-sm text-zinc-600">
          Use filters to quickly find your fit.
        </p>
      </div>

      <section className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Search
          </label>
          <input
            value={query}
            onChange={(event) => {
              setVisibleCount(PAGE_SIZE);
              setQuery(event.target.value);
            }}
            placeholder="Search by product name"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(event) => {
              setVisibleCount(PAGE_SIZE);
              setSelectedCategory(event.target.value);
            }}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Size
          </label>
          <select
            value={selectedSize}
            onChange={(event) => {
              setVisibleCount(PAGE_SIZE);
              setSelectedSize(event.target.value);
            }}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="All">All</option>
            {SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Price Min (INR)
          </label>
          <input
            type="number"
            min={0}
            value={priceMin}
            onChange={(event) => {
              setVisibleCount(PAGE_SIZE);
              setPriceMin(event.target.value);
            }}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Price Max (INR)
          </label>
          <input
            type="number"
            min={0}
            value={priceMax}
            onChange={(event) => {
              setVisibleCount(PAGE_SIZE);
              setPriceMax(event.target.value);
            }}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </section>

      <div className="flex items-center justify-between text-sm text-zinc-600">
        <p>{filteredProducts.length} products found</p>
        <button
          onClick={() => {
            setQuery("");
            setSelectedCategory("All");
            setSelectedSize("All");
            setPriceMin("");
            setPriceMax("");
            setSortBy("newest");
            setVisibleCount(PAGE_SIZE);
          }}
          className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100"
        >
          Reset filters
        </button>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center text-zinc-500">
          No products match your current filters.
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
