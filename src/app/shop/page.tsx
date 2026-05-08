import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

type Product = {
  id?: string | number;
  name?: string;
  title?: string;
  price?: number | string;
  image?: string;
  images?: string[];
  thumbnail?: string;
  mockup?: string;
  slug?: string;
};

type ProductFetchResult = {
  products: Product[];
  error?: string;
};

async function getProducts(): Promise<ProductFetchResult> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const res = await fetch(new URL("/api/printrove/products", baseUrl), {
      cache: "no-store",
    });

    const data = await res.json();
    console.log("Printrove API response:", data);

    if (!res.ok) {
      return {
        products: [],
        error: data?.error || "Failed to fetch products.",
      };
    }

    const products: Product[] =
      data?.products?.products ||
      data?.products ||
      data?.data?.products ||
      data ||
      [];

    return {
      products: Array.isArray(products) ? products : [],
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      error: (error as Error).message || "Failed to fetch products.",
    };
  }
}

export default async function ShopPage() {
  const { products, error } = await getProducts();

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
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
            No products found yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id?.toString() || product.name || product.title || product.slug}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
