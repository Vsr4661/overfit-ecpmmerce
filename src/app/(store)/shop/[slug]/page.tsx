import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductGrid } from "@/components/store/product-card";
import { ProductPurchase } from "@/components/store/product-purchase";
import { Price } from "@/components/ui";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: [product.imageUrl] },
  };
}

export default async function ProductPage({ params }: Params) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);

  const images = [
    { url: product.imageUrl, label: "Front" },
    ...(product.imageBackUrl && product.imageBackUrl !== product.imageUrl
      ? [{ url: product.imageBackUrl, label: "Back" }]
      : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map((image) => image.url),
    category: product.category,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="page pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/shop" className="hover:text-ink">
              Shop
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-ink">
              {product.category}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <section className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <ProductGallery images={images} name={product.name} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="label">{product.category}</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <Price amount={product.price} className="text-2xl font-semibold" />
            <span className="text-xs text-muted">incl. GST</span>
          </div>
          {product.color && (
            <p className="mt-4 text-sm">
              <span className="text-muted">Colour:</span> {product.color}
            </p>
          )}

          <div className="mt-8">
            <ProductPurchase product={product} />
          </div>

          <div className="mt-10 divide-y divide-line border-y border-line">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                Details <span className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink/75">{product.description}</p>
            </details>
            <details id="size-guide" className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                Fit <span className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink/75">
                Cut oversized with dropped shoulders. Take your usual size for the intended loose fit,
                or size down for a closer, regular fit.
              </p>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                Shipping &amp; exchanges <span className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
                <li>
                  Free shipping over {formatCurrency(FREE_SHIPPING_THRESHOLD)}, otherwise{" "}
                  {formatCurrency(FLAT_SHIPPING_FEE)}.
                </li>
                <li>Printed to order and delivered in 3–6 business days across India.</li>
                <li>Exchanges within 7 days of delivery.</li>
              </ul>
            </details>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display mb-8 text-3xl sm:text-4xl">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
