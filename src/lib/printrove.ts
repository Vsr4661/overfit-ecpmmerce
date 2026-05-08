import { normalizePrintroveProducts } from "@/lib/printrove-products";

/**
 * Printrove API helper library.
 *
 * This file is server-only and should only be imported by backend routes.
 * Never expose PRINTROVE_TOKEN to the client.
 */
const PRINTROVE_BASE_URL = "https://api.printrove.com/api/external";
const PRINTROVE_TOKEN = process.env.PRINTROVE_TOKEN;

if (!PRINTROVE_TOKEN) {
  console.error("Missing PRINTROVE_TOKEN environment variable. Add it to .env.local.");
}

export interface PrintroveCategory {
  id: string;
  name: string;
  description?: string;
}

export interface PrintroveProduct {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sku?: string;
  active?: boolean;
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

async function printroveFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!PRINTROVE_TOKEN) {
    throw new Error("Printrove token is not configured. Set PRINTROVE_TOKEN in .env.local.");
  }

  const url = `${PRINTROVE_BASE_URL}${path}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${PRINTROVE_TOKEN}`,
    "Content-Type": "application/json",
    ...init.headers,
  };

  console.log(`[Printrove] Request: ${init.method ?? "GET"} ${url}`);

  const response = await fetch(url, {
    ...init,
    headers,
  });

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
  return await printroveFetch<PrintroveCategory[]>("/categories");
}

/**
 * Fetch Printrove products.
 * Supports optional query params like search or category filters.
 */
export async function getProducts(
  params?: Record<string, string | number | boolean>
): Promise<PrintroveProduct[]> {
  const query = params
    ? `?${new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      ).toString()}`
    : "";

  const raw = await printroveFetch<unknown>(`/products${query}`);
  return normalizePrintroveProducts(raw);
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
