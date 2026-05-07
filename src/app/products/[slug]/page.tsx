import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/store/product-detail-view";
import { getProductBySlug, getProducts } from "@/lib/store";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const allProducts = await getProducts();
  if (!product) notFound();

  const relatedProducts = allProducts
    .filter((item) => item.id !== product.id)
    .filter((item) => item.category === product.category)
    .slice(0, 4);

  const fallbackRelated = allProducts.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts.length > 0 ? relatedProducts : fallbackRelated}
    />
  );
}
