import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
  const pages = ["", "/shop", "/about", "/contact", "/shipping", "/refunds", "/privacy", "/terms"].map((path) => ({
    url: `${siteUrl}${path}`,
  }));
  return [
    ...pages,
    ...products.map((product) => ({ url: `${siteUrl}/shop/${product.slug}`, lastModified: product.updatedAt })),
  ];
}
