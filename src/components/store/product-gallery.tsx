"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: { url: string; label: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return <div className="flex aspect-[4/5] items-center justify-center bg-surface text-sm text-muted">No image</div>;
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <ProductImage
          src={current.url}
          alt={`${name}, ${current.label.toLowerCase()} view`}
          sizes="(min-width: 1024px) 55vw, 100vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3" role="tablist" aria-label="Product images">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Show ${image.label.toLowerCase()} view`}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square overflow-hidden bg-surface ring-offset-2 ring-offset-paper transition",
                active === index ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100",
              )}
            >
              <ProductImage src={image.url} alt="" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
