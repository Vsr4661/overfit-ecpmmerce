/**
 * Printrove API client (server-only). Never expose PRINTROVE_TOKEN to the browser.
 * Docs: https://api.printrove.com/docs/
 */
import {
  normalizePrintroveLibraryDetail,
  normalizePrintroveProducts,
  type PrintroveProduct,
} from "@/lib/printrove-products";

export type { PrintroveProduct };

const PRINTROVE_BASE_URL = "https://api.printrove.com/api/external";

function getPrintroveToken(): string | undefined {
  const raw = process.env.PRINTROVE_TOKEN;
  if (!raw) return undefined;
  return raw.trim().replace(/^["']+|["']+$/g, "") || undefined;
}

export function isPrintroveConfigured() {
  return Boolean(getPrintroveToken());
}

export function isPrintroveAutoFulfilEnabled() {
  return isPrintroveConfigured() && process.env.PRINTROVE_AUTO_FULFIL === "true";
}

export interface PrintroveCategory {
  id: string;
  name: string;
  description?: string;
}

function formatFetchError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = (err as Error & { cause?: NodeJS.ErrnoException & { hostname?: string } }).cause;
  if (cause && typeof cause === "object") {
    const parts = [cause.syscall, cause.code, cause.hostname].filter(Boolean);
    if (parts.length) return `${err.message} (${parts.join(" ")})`;
  }
  return err.message;
}

async function printroveFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getPrintroveToken();
  if (!token) throw new Error("PRINTROVE_TOKEN is not set.");

  let response: Response;
  try {
    response = await fetch(`${PRINTROVE_BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    throw new Error(`Cannot reach Printrove API: ${formatFetchError(err)}`);
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `Printrove request failed with status ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export async function getCategories(): Promise<PrintroveCategory[]> {
  const raw = await printroveFetch<unknown>("/categories");
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { categories?: unknown }).categories)
      ? (raw as { categories: unknown[] }).categories
      : [];
  return list.map((c) => {
    const row = c as { id: unknown; name: unknown; description?: string };
    return { id: String(row.id), name: String(row.name), description: row.description };
  });
}

type CatalogVariantPrice = { id: number; base_price?: number; gst?: number };

const parentCategoryIdCache = new Map<number, number | null>();
const catalogVariantsByParentCache = new Map<string, CatalogVariantPrice[]>();

function retailInclGst(v: CatalogVariantPrice): number | undefined {
  if (v.base_price == null || !Number.isFinite(v.base_price)) return undefined;
  const g = v.gst ?? 0;
  if (g === 0) return v.base_price;
  return Math.round(v.base_price * (1 + g / 100) * 100) / 100;
}

async function resolveCategoryIdForParentProduct(parentProductId: number): Promise<number | null> {
  if (parentCategoryIdCache.has(parentProductId)) {
    return parentCategoryIdCache.get(parentProductId)!;
  }
  const categories = await getCategories();
  for (const c of categories) {
    const catId = Number(c.id);
    if (Number.isNaN(catId)) continue;
    try {
      const body = await printroveFetch<{ product?: { variants?: unknown[] } }>(
        `/categories/${catId}/products/${parentProductId}`
      );
      const variants = body?.product?.variants;
      if (Array.isArray(variants) && variants.length > 0) {
        parentCategoryIdCache.set(parentProductId, catId);
        catalogVariantsByParentCache.set(
          `${catId}:${parentProductId}`,
          variants.map((row: unknown) => {
            const v = row as { id?: unknown; base_price?: unknown; gst?: unknown };
            return {
              id: Number(v.id),
              base_price: v.base_price != null ? Number(v.base_price) : undefined,
              gst: v.gst != null ? Number(v.gst) : undefined,
            };
          })
        );
        return catId;
      }
    } catch {
      /* wrong category or unavailable */
    }
  }
  parentCategoryIdCache.set(parentProductId, null);
  return null;
}

type LibrarySkuDetail = { parentProductId: number; catalogVariantId: number };

async function fetchLibraryProductSkuDetail(libraryProductId: number): Promise<LibrarySkuDetail | null> {
  try {
    const body = await printroveFetch<{ product?: Record<string, unknown> }>(
      `/products/${libraryProductId}`
    );
    const p = body?.product;
    const variants = p?.variants as unknown[] | undefined;
    const parent = p?.product as { id?: unknown } | undefined;
    const v0 = Array.isArray(variants) ? (variants[0] as Record<string, unknown> | undefined) : undefined;
    const inner = v0?.product as { id?: unknown } | undefined;
    const parentId = parent?.id;
    const catalogVariantId = inner?.id;
    if (parentId == null || catalogVariantId == null) return null;
    return {
      parentProductId: Number(parentId),
      catalogVariantId: Number(catalogVariantId),
    };
  } catch {
    return null;
  }
}

function lookupRetailPrice(parentProductId: number, catalogVariantId: number): number | undefined {
  const catId = parentCategoryIdCache.get(parentProductId);
  if (catId === undefined || catId === null) return undefined;
  const rows = catalogVariantsByParentCache.get(`${catId}:${parentProductId}`);
  const row = rows?.find((r) => r.id === catalogVariantId);
  return row ? retailInclGst(row) : undefined;
}

async function runPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    await Promise.all(chunk.map((item) => fn(item)));
  }
}

/**
 * Printrove's product library list has no price. Base rates live on catalog variants
 * (categories/{cat}/products/{parentId}). We match the library SKU to that variant.
 */
export async function enrichPrintroveRetailPrices(products: PrintroveProduct[]): Promise<void> {
  const libraryIds = [
    ...new Set(
      products
        .map((p) => p.id)
        .filter((id): id is string | number => id != null)
        .map((id) => Number(id))
        .filter((n) => !Number.isNaN(n))
    ),
  ];
  if (libraryIds.length === 0) return;

  const detailByLibrary = new Map<number, LibrarySkuDetail | null>();
  await runPool(libraryIds, 5, async (libraryId) => {
    detailByLibrary.set(libraryId, await fetchLibraryProductSkuDetail(libraryId));
  });

  const parentIds = [
    ...new Set(
      [...detailByLibrary.values()]
        .filter((d): d is LibrarySkuDetail => d != null)
        .map((d) => d.parentProductId)
    ),
  ];

  await runPool(parentIds, 2, async (parentId) => {
    await resolveCategoryIdForParentProduct(parentId);
  });

  for (const p of products) {
    if (p.id == null) continue;
    const libId = Number(p.id);
    if (Number.isNaN(libId)) continue;
    const d = detailByLibrary.get(libId);
    if (!d) continue;
    const retail = lookupRetailPrice(d.parentProductId, d.catalogVariantId);
    if (retail != null) p.price = retail;
  }
}

const PAGE_SIZE = 20;

/** Every product in the merchant's Printrove Product Library, with cost prices. */
export async function listLibraryProducts(): Promise<PrintroveProduct[]> {
  const all: PrintroveProduct[] = [];
  for (let page = 1; page <= 50; page++) {
    const raw = await printroveFetch<unknown>(`/products?page=${page}&per_page=${PAGE_SIZE}`);
    const batch = normalizePrintroveProducts(raw);
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  await enrichPrintroveRetailPrices(all);
  return all;
}

export type PrintroveLibraryVariant = { id: number; size?: string; color?: string; sku?: string };

/** Full library product (mockups, design) plus every variant (one per size/colour). */
export async function getLibraryProductDetail(libraryId: string | number) {
  const raw = await printroveFetch<{ product?: { variants?: unknown[] } }>(
    `/products/${encodeURIComponent(String(libraryId))}`,
  );
  const product = normalizePrintroveLibraryDetail(raw);
  const variants: PrintroveLibraryVariant[] = (raw?.product?.variants ?? []).flatMap((row) => {
    const v = row as { id?: unknown; sku?: unknown; product?: { size?: unknown; color?: unknown } };
    if (v.id == null) return [];
    return [
      {
        id: Number(v.id),
        sku: typeof v.sku === "string" ? v.sku : undefined,
        size: typeof v.product?.size === "string" ? v.product.size : undefined,
        color: typeof v.product?.color === "string" ? v.product.color : undefined,
      },
    ];
  });
  return { product, variants };
}

export type PrintroveOrderInput = {
  reference: string;
  retailPrice: number;
  customer: {
    name: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  lines: { variantId: number; quantity: number }[];
};

/** Places a prepaid order for saved library products. Returns Printrove's order id. */
export async function submitPrintroveOrder(input: PrintroveOrderInput) {
  // The API rejects unknown fields, so only send documented ones.
  const customer: Record<string, string> = {
    name: input.customer.name,
    number: input.customer.phone.replace(/\D/g, "").slice(-10),
    address1: input.customer.address1,
    city: input.customer.city,
    state: input.customer.state,
    pincode: input.customer.pincode,
    country: input.customer.country,
  };
  if (input.customer.address2) customer.address2 = input.customer.address2;

  const result = await printroveFetch<{ id?: unknown; order?: { id?: unknown } }>("/orders", {
    method: "POST",
    body: JSON.stringify({
      reference_number: input.reference,
      retail_price: input.retailPrice,
      cod: false,
      customer,
      order_products: input.lines.map((line) => ({
        variant_id: line.variantId,
        quantity: line.quantity,
      })),
    }),
  });
  const id = result?.id ?? result?.order?.id;
  if (id == null) throw new Error("Printrove did not return an order id.");
  return { id: String(id) };
}
