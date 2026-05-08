import ProductCard from "@/components/ProductCard";
import type { PrintroveProduct } from "@/lib/printrove-products";
import { getProducts as getPrintroveProducts } from "@/lib/printrove";

export const dynamic = "force-dynamic";

type ProductFetchResult = {
  products: PrintroveProduct[];
  error?: string;
};

async function getProducts(): Promise<ProductFetchResult> {
  try {
    const products = await getPrintroveProducts();
    return { products };
  } catch (error) {
    console.error("Error fetching Printrove products:", error);
    return {
      products: [],
      error: (error as Error).message || "Failed to fetch products.",
    };
  }
}

export default async function ShopPage() {
  const { products, error } = await getProducts();

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
            Shop
          </h1>
          <p className="mt-3 text-zinc-600">Explore the latest Printrove products.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
            <p className="font-semibold">Unable to load products</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600">
            <p>No products found yet.</p>
            <p className="mt-2 text-sm text-zinc-500">
              If your Printrove library has SKUs, check the server logs for API errors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={
                  product.id?.toString() ??
                  product.slug ??
                  `${product.name ?? product.title ?? "product"}-${product.image ?? ""}`
                }
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
