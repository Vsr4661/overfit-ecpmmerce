"use client";

import { useCallback, useEffect, useState } from "react";
import type { PrintroveGalleryItem } from "@/lib/printrove-products";
import { cn } from "@/lib/utils";

type Item = PrintroveGalleryItem | { url: string; label: string };

export function ProductImageGallery({
  items,
  productName,
  className,
}: {
  items: Item[];
  productName: string;
  className?: string;
}) {
  const safeItems = items.filter((i) => i.url);
  const [active, setActive] = useState(0);

  const urlsKey = safeItems.map((i) => i.url).join("|");
  useEffect(() => {
    setActive(0);
  }, [urlsKey]);

  const current = safeItems[active] ?? safeItems[0];
  const showThumbs = safeItems.length > 1;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (safeItems.length === 0) return;
      setActive((i) => (i + dir + safeItems.length) % safeItems.length);
    },
    [safeItems.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!current) {
    return (
      <div
        className={cn(
          "flex aspect-square items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-sm text-zinc-500",
          className,
        )}
      >
        No image
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 sm:aspect-[4/5]">
        <img
          src={current.url}
          alt={`${productName} — ${current.label}`}
          className="h-full w-full object-contain object-center"
          loading="lazy"
        />
        {safeItems.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-lg text-zinc-800 shadow-sm backdrop-blur hover:bg-white sm:flex"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white/90 text-lg text-zinc-800 shadow-sm backdrop-blur hover:bg-white sm:flex"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
              {safeItems.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    i === active ? "bg-zinc-900" : "bg-zinc-300",
                  )}
                />
              ))}
            </div>
          </>
        )}
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
          {current.label}
        </div>
      </div>

      {showThumbs && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {safeItems.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                active === index ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400",
              )}
            >
              <img
                src={item.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-center text-[10px] font-medium text-white">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
