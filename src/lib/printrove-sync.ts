import { prisma } from "@/lib/prisma";
import { getLibraryProductDetail, listLibraryProducts } from "@/lib/printrove";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/** Cost x markup, rounded up to a price ending in 99 (e.g. 1240 -> 1299). */
function retailFromCost(cost: number) {
  const markup = Number(process.env.PRINTROVE_MARKUP ?? "1.8");
  const raw = cost * (Number.isFinite(markup) && markup >= 1 ? markup : 1.8);
  return Math.ceil((raw + 1) / 100) * 100 - 1;
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL", "5XL"];

function sortSizes(sizes: string[]) {
  return [...new Set(sizes)].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export type SyncResult = { created: number; updated: number; skipped: string[] };

/**
 * Imports the Printrove Product Library into the local catalog.
 * New products get price = cost x PRINTROVE_MARKUP; existing products keep their admin-set
 * price and active flag, and only refresh cost, images, sizes and variant ids.
 */
export async function syncPrintroveCatalog(): Promise<SyncResult> {
  const library = await listLibraryProducts();
  const result: SyncResult = { created: 0, updated: 0, skipped: [] };

  for (const item of library) {
    if (item.id == null) continue;
    const printroveId = String(item.id);
    const label = item.name || item.title || `Printrove #${printroveId}`;

    const { product: detail, variants } = await getLibraryProductDetail(printroveId);
    const imageUrl = detail?.imageFront || detail?.image || item.imageFront || item.image;
    if (!imageUrl) {
      result.skipped.push(`${label}: no mockup image`);
      continue;
    }
    const cost = typeof item.price === "number" ? item.price : Number(item.price);
    if (!Number.isFinite(cost) || cost <= 0) {
      result.skipped.push(`${label}: no cost price from Printrove`);
      continue;
    }

    const categoryName = item.catalogName || "Printed";
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName, slug: slugify(categoryName) || "printed" },
    });

    const shared = {
      costPrice: cost,
      imageUrl,
      imageBackUrl: detail?.imageBack ?? item.imageBack ?? null,
      sizes: sortSizes(variants.map((v) => v.size).filter((s): s is string => Boolean(s))).join(","),
      color: variants.find((v) => v.color)?.color ?? item.variantColor ?? null,
      printroveVariants: JSON.stringify(variants.map(({ id, size, sku }) => ({ id, size, sku }))),
      categoryId: category.id,
    };

    const existing = await prisma.product.findUnique({ where: { printroveId } });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: shared });
      result.updated++;
    } else {
      await prisma.product.create({
        data: {
          ...shared,
          printroveId,
          name: label,
          slug: `${slugify(label)}-${printroveId}`,
          description: `${item.title ?? label}, printed on demand and shipped from India.`,
          price: retailFromCost(cost),
          // Print-on-demand: no stock limit; checkout caps quantity per order instead.
          inventory: 9999,
        },
      });
      result.created++;
    }
  }
  return result;
}
