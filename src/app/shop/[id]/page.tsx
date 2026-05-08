import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintroveProductDetailView } from "@/components/store/PrintroveProductDetailView";
import { getPrintroveLibraryProduct, getProducts as getPrintroveProducts } from "@/lib/printrove";

export const dynamic = "force-dynamic";

export default async function PrintroveShopProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id || id === "undefined") notFound();

  const product = await getPrintroveLibraryProduct(id);
  if (!product) notFound();

  const all = await getPrintroveProducts();
  const relatedProducts = all.filter((p) => String(p.id) !== String(product.id)).slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <PrintroveProductDetailView product={product} relatedProducts={relatedProducts} />
        <p className="mt-10 text-center text-sm text-zinc-500">
          <Link href="/shop" className="font-medium text-zinc-800 underline-offset-4 hover:underline">
            ← Back to shop
          </Link>
        </p>
      </div>
    </div>
  );
}
