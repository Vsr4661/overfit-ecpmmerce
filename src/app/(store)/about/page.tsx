import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="page max-w-3xl pt-12">
      <p className="label">About {BUSINESS.brandName}</p>
      <h1 className="display mt-3 text-5xl sm:text-7xl">
        Room to <span className="text-accent">move.</span>
      </h1>
      <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink/80">
        <p>
          {BUSINESS.brandName} makes oversized essentials: heavyweight tees, hoodies and outerwear with dropped
          shoulders and a relaxed cut, designed in India for everyday wear.
        </p>
        <p>
          Every piece is printed after you order it. That means no warehouses full of unsold stock, no end-of-season
          dumping, and designs we can keep fresh without worrying about leftover inventory.
        </p>
        <p>
          We keep the range small on purpose. Fewer pieces, better made, cut to fit the way they should.
        </p>
      </div>
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/shop" className={buttonClasses("primary", "lg")}>
          Shop the collection
        </Link>
        <Link href="/contact" className={buttonClasses("secondary", "lg")}>
          Get in touch
        </Link>
      </div>
    </div>
  );
}
