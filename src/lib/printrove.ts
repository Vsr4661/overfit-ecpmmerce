import dns from "node:dns";
import {
  normalizePrintroveLibraryDetail,
  normalizePrintroveProducts,
  type PrintroveProduct,
} from "@/lib/printrove-products";

export type { PrintroveProduct };

// Prefer IPv4 when IPv6 routes/DNS are broken (common cause of undici "fetch failed" + EAI_AGAIN).
dns.setDefaultResultOrder("ipv4first");

/**
 * Printrove API helper library.
 *
 * This file is server-only and should only be imported by backend routes.
 * Never expose PRINTROVE_TOKEN to the client.
 */
const PRINTROVE_BASE_URL = "https://api.printrove.com/api/external";

function getPrintroveToken(): string | undefined {
  const raw = process.env.PRINTROVE_TOKEN;
  if (!raw) return undefined;
  return raw.trim().replace(/^["']+|["']+$/g, "");
}

if (!getPrintroveToken()) {
  console.error("Missing PRINTROVE_TOKEN environment variable. Add it to .env.local.");
}

export interface PrintroveCategory {
  id: string;
  name: string;
  description?: string;
}

export interface PrintroveOrderItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface PrintroveOrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  items: PrintroveOrderItem[];
  notes?: string;
}

export interface PrintroveOrderResponse {
  orderId: string;
  status: string;
  message?: string;
  data?: Record<string, unknown>;
}

function formatFetchError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const anyErr = err as Error & {
    cause?: NodeJS.ErrnoException & { hostname?: string };
  };
  const c = anyErr.cause;
  if (c && typeof c === "object") {
    const code = c.code ?? "";
    const syscall = c.syscall ?? "";
    const host = c.hostname ?? "";
    const parts = [syscall, code, host].filter(Boolean);
    if (parts.length) return `${anyErr.message} (${parts.join(" ")})`;
  }
  return anyErr.message;
}

async function printroveFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getPrintroveToken();
  if (!token) {
    throw new Error("Printrove token is not configured. Set PRINTROVE_TOKEN in .env.local.");
  }

  const url = `${PRINTROVE_BASE_URL}${path}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...init.headers,
  };

  console.log(`[Printrove] Request: ${init.method ?? "GET"} ${url}`);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (err) {
    const detail = formatFetchError(err);
    console.error("[Printrove] fetch failed:", detail);
    throw new Error(
      `Cannot reach Printrove API (${detail}). Check internet, DNS, VPN, and firewall. ` +
        "If you use WSL or Docker, fix DNS (e.g. /etc/resolv.conf) or try another network."
    );
  }

  const text = await response.text();
  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      console.warn("[Printrove] Response is not valid JSON", parseError, text);
      body = text;
    }
  }

  if (!response.ok) {
    console.error("[Printrove] Error response:", response.status, body);
    throw new Error(
      typeof body === "object" && body !== null && "message" in body
        ? (body as any).message
        : `Printrove request failed with status ${response.status}`
    );
  }

  return body as T;
}

/**
 * Fetch Printrove categories.
 */
export async function getCategories(): Promise<PrintroveCategory[]> {
  const raw = await printroveFetch<unknown>("/categories");
  if (Array.isArray(raw)) {
    return (raw as { id: unknown; name: unknown; description?: string }[]).map((c) => ({
      id: String(c.id),
      name: String(c.name),
      description: c.description,
    }));
  }
  if (raw && typeof raw === "object" && "categories" in raw) {
    const arr = (raw as { categories: unknown }).categories;
    if (Array.isArray(arr)) {
      return arr.map((c) => ({
        id: String((c as { id: unknown }).id),
        name: String((c as { name: unknown }).name),
        description: (c as { description?: string }).description,
      }));
    }
  }
  return [];
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

/**
 * Fetch Printrove products.
 * Supports optional query params like search or category filters.
 */
export async function getProducts(
  params?: Record<string, string | number | boolean>
): Promise<PrintroveProduct[]> {
  const defaults: Record<string, string> = { page: "1", per_page: "20" };
  const merged: Record<string, string> = { ...defaults };
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") continue;
      merged[key] = String(value);
    }
  }
  const query = `?${new URLSearchParams(merged).toString()}`;

  const raw = await printroveFetch<unknown>(`/products${query}`);
  const products = normalizePrintroveProducts(raw);
  await enrichPrintroveRetailPrices(products);
  return products;
}

/**
 * One library product with mockups, design URLs, variant meta, and enriched price.
 */
export async function getPrintroveLibraryProduct(
  libraryId: string | number
): Promise<PrintroveProduct | null> {
  const raw = await printroveFetch<unknown>(
    `/products/${encodeURIComponent(String(libraryId))}`
  );
  const product = normalizePrintroveLibraryDetail(raw);
  if (!product) return null;
  await enrichPrintroveRetailPrices([product]);
  return product;
}

/**
 * Create a Printrove order.
 */
export async function createOrder(
  payload: PrintroveOrderPayload
): Promise<PrintroveOrderResponse> {
  return await printroveFetch<PrintroveOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch a single Printrove order by ID.
 */
export async function getOrderById(orderId: string): Promise<PrintroveOrderResponse> {
  return await printroveFetch<PrintroveOrderResponse>(`/orders/${encodeURIComponent(orderId)}`);
}
