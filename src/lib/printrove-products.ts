export type PrintroveProduct = {
  id?: string | number;
  name?: string;
  title?: string;
  price?: number | string;
  image?: string;
  images?: string[];
  thumbnail?: string;
  mockup?: string;
  slug?: string;
  [key: string]: unknown;
};

function getImageUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(getImageUrl).find(Boolean) as string | undefined;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      getImageUrl(obj.url) ||
      getImageUrl(obj.src) ||
      getImageUrl(obj.secure_url) ||
      getImageUrl(obj.thumbnail) ||
      getImageUrl(obj.asset) ||
      getImageUrl(obj.image) ||
      getImageUrl(obj.mockup)
    );
  }
  return undefined;
}

function normalizeProduct(raw: any): PrintroveProduct {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const image =
    getImageUrl(raw.image) ||
    getImageUrl(raw.thumbnail) ||
    getImageUrl(raw.mockup) ||
    getImageUrl(raw.images?.[0]) ||
    getImageUrl(raw.imageUrl) ||
    getImageUrl(raw.product_image) ||
    getImageUrl(raw.media?.[0]) ||
    getImageUrl(raw.asset);

  const price =
    raw.price ??
    raw.amount ??
    raw.price_in_cents ??
    raw.list_price ??
    raw.sale_price ??
    raw.product_price;

  return {
    id: raw.id ?? raw._id ?? raw.productId ?? raw.sku,
    name: raw.name || raw.title || raw.product_name || raw.title_text,
    title: raw.title || raw.name || raw.product_name || raw.title_text,
    price,
    image,
    images: Array.isArray(raw.images)
      ? raw.images.map(getImageUrl).filter(Boolean) as string[]
      : undefined,
    thumbnail: getImageUrl(raw.thumbnail),
    mockup: getImageUrl(raw.mockup),
    slug: raw.slug || raw.handle || raw.product_slug,
  };
}

export function normalizePrintroveProducts(rawResponse: unknown): PrintroveProduct[] {
  const products =
    (rawResponse as any)?.products?.products ||
    (rawResponse as any)?.products ||
    (rawResponse as any)?.data?.products ||
    rawResponse;

  if (!Array.isArray(products)) {
    return [];
  }

  return products.map(normalizeProduct);
}
