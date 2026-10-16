import Link from "next/link";
import { POLICY } from "@/lib/business";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/store/product-card";
import { ProductImage, buttonClasses } from "@/components/ui";
import { getCategoriesWithCovers, getProducts } from "@/lib/catalog";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

const PROMISES = [
  "Heavyweight cotton",
  "Cut oversized",
  "Printed on demand in India",
  `Free shipping over ${formatCurrency(FREE_SHIPPING_THRESHOLD)}`,
  `${POLICY.exchangeWindowDays}-day size exchanges`,
  "UPI · cards · netbanking",
];

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts({ take: 8 }), getCategoriesWithCovers()]);
  const hero = products[0];

  return (
    <>
      <section className="page grid items-end gap-8 pb-12 pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pt-16">
        <div className="space-y-8 lg:pb-8">
          <p className="label">New season · Drop 01</p>
          <h1 className="display text-[clamp(3rem,7.5vw,7rem)]">
            Made to
            <br />
            hang <span className="text-accent">loose.</span>
          </h1>
          <p className="max-w-md text-base text-ink/70">
            Heavyweight tees, hoodies and outerwear with dropped shoulders and room to move.
            Printed when you order, so nothing sits in a warehouse.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className={buttonClasses("primary", "lg")}>
              Shop the drop <ArrowRight className="h-4 w-4" />
            </Link>
            {categories[0] && (
              <Link href={`/shop?category=${categories[0].slug}`} className={buttonClasses("secondary", "lg")}>
                {categories[0].name}
              </Link>
            )}
          </div>
        </div>

        {hero && (
          <Link href={`/shop/${hero.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-surface">
            <ProductImage
              src={hero.imageUrl}
              alt={hero.name}
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
              className="transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-5 text-white">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-label text-white/70">Featured</p>
                <p className="mt-1 text-lg font-semibold">{hero.name}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums">{formatCurrency(hero.price)}</span>
            </div>
          </Link>
        )}
      </section>

      <div className="overflow-hidden border-y border-ink bg-accent py-3 text-white" aria-hidden>
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          {[...PROMISES, ...PROMISES].map((item, index) => (
            <span key={index} className="display text-lg">
              {item} <span className="ml-10">✦</span>
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">{PROMISES.join(". ")}</p>

      {products.length > 0 ? (
        <section className="page mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="display text-4xl sm:text-5xl">New in</h2>
            <Link href="/shop" className="text-xs font-semibold uppercase tracking-[0.08em] underline-offset-4 hover:underline">
              View all
            </Link>
          </div>
          <ProductGrid products={products} />
        </section>
      ) : (
        <section className="page mt-20 border border-dashed border-line p-12 text-center text-muted">
          The first drop is on its way. Check back soon.
        </section>
      )}

      {categories.length > 0 && (
        <section className="page mt-24">
          <h2 className="display mb-8 text-4xl sm:text-5xl">Shop by category</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.slug}
                href={`/shop?category=${category.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden bg-ink"
              >
                {category.coverUrl && (
                  <ProductImage
                    src={category.coverUrl}
                    alt=""
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-60"
                  />
                )}
                <div className="absolute inset-0 flex items-end justify-between p-5 text-white">
                  <span className="display text-3xl">{category.name}</span>
                  <span className="text-xs font-semibold">{category.count} {category.count === 1 ? "style" : "styles"}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="page mt-24">
        <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
        {[
          { title: "Printed to order", body: "Every piece is printed after you buy it. Less waste, no dead stock." },
          { title: `Ships in ${POLICY.dispatchDays} days`, body: `Tracked delivery across India. Free over ${formatCurrency(FREE_SHIPPING_THRESHOLD)}.` },
          { title: "Easy exchanges", body: `Wrong size? Exchange within ${POLICY.exchangeWindowDays} days of delivery.` },
        ].map((item) => (
          <div key={item.title} className="bg-paper p-8">
            <h3 className="text-sm font-bold uppercase tracking-[0.08em]">{item.title}</h3>
            <p className="mt-2 text-sm text-muted">{item.body}</p>
          </div>
        ))}
        </div>
      </section>
    </>
  );
}
