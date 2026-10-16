import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseSizes } from "@/lib/pricing";
import type { Product } from "@/types";

type ProductRow = Prisma.ProductGetPayload<{ include: { category: true } }>;

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    imageUrl: row.imageUrl,
    imageBackUrl: row.imageBackUrl,
    category: row.category.name,
    categorySlug: row.category.slug,
    sizes: parseSizes(row.sizes),
    color: row.color,
    inventory: row.inventory,
  };
}

export async function getProducts(options: { categorySlug?: string; take?: number } = {}) {
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(options.categorySlug ? { category: { slug: options.categorySlug } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: options.take,
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string) {
  const row = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true },
  });
  return row ? toProduct(row) : null;
}

export async function getRelatedProducts(product: Product, take = 4) {
  const sameCategory = await prisma.product.findMany({
    where: { isActive: true, id: { not: product.id }, category: { slug: product.categorySlug } },
    include: { category: true },
    take,
  });
  if (sameCategory.length >= take) return sameCategory.map(toProduct);

  const others = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { notIn: [product.id, ...sameCategory.map((row) => row.id)] },
    },
    include: { category: true },
    take: take - sameCategory.length,
  });
  return [...sameCategory, ...others].map(toProduct);
}

/** Categories that have at least one active product, with a cover image. */
export async function getCategoriesWithCovers() {
  const categories = await prisma.category.findMany({
    where: { products: { some: { isActive: true } } },
    include: {
      products: { where: { isActive: true }, take: 1, orderBy: { createdAt: "desc" } },
      _count: { select: { products: { where: { isActive: true } } } },
    },
    orderBy: { products: { _count: "desc" } },
  });
  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    count: category._count.products,
    coverUrl: category.products[0]?.imageUrl ?? null,
  }));
}
