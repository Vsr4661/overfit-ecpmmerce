import Link from "next/link";
import PrintroveProductCard from "@/components/ProductCard";
import { ProductCard } from "@/components/store/ProductCard";
import { getProducts as getPrintroveCatalog } from "@/lib/printrove";
import { getProducts } from "@/lib/store";
import type { Product } from "@/types";
import type { PrintroveProduct } from "@/lib/printrove-products";

export const dynamic = "force-dynamic";

type Featured =
  | { source: "printrove"; products: PrintroveProduct[]; hasMore: boolean }
  | { source: "store"; products: Product[]; hasMore: boolean };

async function getFeaturedProducts(): Promise<Featured> {
  try {
    const catalog = await getPrintroveCatalog();
    if (catalog.length > 0) {
      return {
        source: "printrove",
        products: catalog.slice(0, 4),
        hasMore: catalog.length > 4,
      };
    }
  } catch {
    /* fall back to local / mock catalog */
  }

  const all = await getProducts();
  return {
    source: "store",
    products: all.slice(0, 4),
    hasMore: all.length > 4,
  };
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const allProductsLink = featured.source === "printrove" ? "/shop" : "/products";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              OVERFIT
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Premium streetwear designed for the modern individual.
              Quality craftsmanship meets urban style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                Shop Collection
              </Link>
              <Link
                href={allProductsLink}
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our latest drops and best-sellers
            </p>
          </div>

          {featured.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.source === "printrove"
                ? featured.products.map((product) => (
                    <PrintroveProductCard
                      key={
                        product.id?.toString() ??
                        product.slug ??
                        `${product.name ?? product.title ?? "product"}`
                      }
                      product={product}
                    />
                  ))
                : featured.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h3>
                <p className="text-gray-600">Check back soon for new arrivals!</p>
              </div>
            </div>
          )}

          {featured.hasMore && (
            <div className="text-center mt-12">
              <Link
                href={allProductsLink}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                View All Products
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600">
              Find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              href="/products?category=T-Shirts"
              className="group relative overflow-hidden rounded-lg bg-gray-100 aspect-square"
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">T-Shirts</h3>
              </div>
            </Link>

            <Link
              href="/products?category=Hoodies"
              className="group relative overflow-hidden rounded-lg bg-gray-200 aspect-square"
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Hoodies</h3>
              </div>
            </Link>

            <Link
              href="/products?category=Outerwear"
              className="group relative overflow-hidden rounded-lg bg-gray-300 aspect-square"
            >
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">Outerwear</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}