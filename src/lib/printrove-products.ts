export type PrintroveGalleryItem = {
  url: string;
  label: string;
};

export type PrintroveProduct = {
  id?: string | number;
  name?: string;
  title?: string;
  /** Parent catalog product name when different from library title */
  catalogName?: string;
  price?: number | string;
  /** Primary image (usually front mockup) — backward compatible */
  image?: string;
  imageFront?: string;
  imageBack?: string;
  /** Ordered gallery for detail UI (mockups + design files, deduped) */
  gallery?: PrintroveGalleryItem[];
  images?: string[];
  thumbnail?: string;
  mockup?: string;
  slug?: string;
  variantSize?: string;
  variantColor?: string;
  sku?: string;
  [key: string]: unknown;
};

/** Pull a product array from common Printrove / Laravel-style envelopes. */
function extractProductsArray(rawResponse: unknown): unknown[] {
  if (Array.isArray(rawResponse)) return rawResponse;
  if (!rawResponse || typeof rawResponse !== "object") return [];

  const root = rawResponse as Record<string, unknown>;

  if (Array.isArray(root.data)) return root.data;

  if (root.data && typeof root.data === "object") {
    const inner = root.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) return inner.data;
    if (Array.isArray(inner.products)) return inner.products;
  }

  if (Array.isArray(root.products)) return root.products;

  if (root.products && typeof root.products === "object") {
    const p = root.products as Record<string, unknown>;
    if (Array.isArray(p.products)) return p.products;
    if (Array.isArray(p.data)) return p.data;
  }

  if (Array.isArray(root.results)) return root.results;
  if (Array.isArray(root.items)) return root.items;

  return [];
}

function coercePrice(raw: unknown): number | string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseFloat(raw.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(n)) return n;
    return raw;
  }
  return undefined;
}

function asUrlString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function getImageUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (Array.isArray(value)) {
    return value.map(getImageUrl).find(Boolean) as string | undefined;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      getImageUrl(obj.front_mockup_thumbnail) ||
      getImageUrl(obj.front_mockup) ||
      getImageUrl(obj.back_mockup_thumbnail) ||
      getImageUrl(obj.back_mockup) ||
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

/** Front / back mockup URLs from Printrove `mockup` object. */
function sidesFromMockup(mockup: unknown): { front?: string; back?: string } {
  if (!mockup || typeof mockup !== "object") return {};
  const m = mockup as Record<string, unknown>;
  const front =
    asUrlString(m.front_mockup_thumbnail) ||
    asUrlString(m.front_mockup) ||
    undefined;
  const back =
    asUrlString(m.back_mockup_thumbnail) ||
    asUrlString(m.back_mockup) ||
    undefined;
  return { front, back };
}

function getPrimaryVariant(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  const variants = raw.variants;
  if (!Array.isArray(variants) || variants.length === 0) return undefined;
  const v0 = variants[0];
  return v0 && typeof v0 === "object" ? (v0 as Record<string, unknown>) : undefined;
}

function getEffectiveMockup(raw: Record<string, unknown>): unknown {
  return raw.mockup ?? getPrimaryVariant(raw)?.mockup;
}

function getEffectiveDesign(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  const d = raw.design ?? getPrimaryVariant(raw)?.design;
  return d && typeof d === "object" ? (d as Record<string, unknown>) : undefined;
}

function buildGallery(
  imageFront: string | undefined,
  imageBack: string | undefined,
  design: Record<string, unknown> | undefined,
): PrintroveGalleryItem[] {
  const gallery: PrintroveGalleryItem[] = [];
  const seen = new Set<string>();

  const push = (url: string | undefined, label: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    gallery.push({ url, label });
  };

  push(imageFront, "Front");
  push(imageBack, "Back");

  if (design) {
    const front = design.front;
    const back = design.back;
    const frontUrl =
      front && typeof front === "object"
        ? asUrlString((front as Record<string, unknown>).url)
        : undefined;
    const backUrl =
      back && typeof back === "object"
        ? asUrlString((back as Record<string, unknown>).url)
        : undefined;
    push(frontUrl, "Front print");
    push(backUrl, "Back print");
  }

  return gallery;
}

function normalizeProductName(raw: Record<string, unknown>): {
  name?: string;
  title?: string;
  catalogName?: string;
} {
  const variantLabel =
    (typeof raw.name === "string" && raw.name) ||
    (typeof raw.title === "string" && raw.title) ||
    (typeof raw.product_name === "string" && raw.product_name) ||
    (typeof raw.title_text === "string" && raw.title_text) ||
    undefined;

  let catalogLabel: string | undefined;
  if (raw.product && typeof raw.product === "object" && raw.product !== null) {
    const pn = (raw.product as { name?: unknown }).name;
    if (typeof pn === "string" && pn.trim()) catalogLabel = pn.trim();
  }

  if (catalogLabel && variantLabel && catalogLabel !== variantLabel.trim()) {
    return {
      name: `${catalogLabel} — ${variantLabel.trim()}`,
      title: variantLabel.trim(),
      catalogName: catalogLabel,
    };
  }

  return {
    name: variantLabel || catalogLabel,
    title: variantLabel || catalogLabel,
    catalogName: catalogLabel,
  };
}

function variantMetaFromRaw(raw: Record<string, unknown>): {
  variantSize?: string;
  variantColor?: string;
  sku?: string;
} {
  const v0 = getPrimaryVariant(raw);
  if (!v0) return {};
  const sku = typeof v0.sku === "string" ? v0.sku : undefined;
  const inner = v0.product;
  if (!inner || typeof inner !== "object") return { sku };
  const p = inner as Record<string, unknown>;
  const variantSize = typeof p.size === "string" ? p.size : undefined;
  const variantColor = typeof p.color === "string" ? p.color : undefined;
  return { variantSize, variantColor, sku };
}

function normalizeProduct(raw: Record<string, unknown>): PrintroveProduct {
  const { name, title, catalogName } = normalizeProductName(raw);
  const { variantSize, variantColor, sku } = variantMetaFromRaw(raw);

  const mockupObj = getEffectiveMockup(raw);
  const { front: imageFront, back: imageBack } = sidesFromMockup(mockupObj);
  const design = getEffectiveDesign(raw);
  const gallery = buildGallery(imageFront, imageBack, design);

  const firstLegacyImage = Array.isArray(raw.images) ? raw.images[0] : undefined;
  const firstMedia = Array.isArray(raw.media) ? raw.media[0] : undefined;

  const image =
    imageFront ||
    getImageUrl(raw.image) ||
    getImageUrl(raw.thumbnail) ||
    getImageUrl(firstLegacyImage) ||
    getImageUrl(raw.imageUrl) ||
    getImageUrl(raw.product_image) ||
    getImageUrl(firstMedia) ||
    getImageUrl(raw.asset) ||
    imageBack;

  let priceRaw: unknown =
    raw.price ??
    raw.amount ??
    raw.retail_price ??
    raw.list_price ??
    raw.sale_price ??
    raw.product_price;

  if (priceRaw == null && raw.price_in_cents != null) {
    priceRaw = Number(raw.price_in_cents) / 100;
  }

  const price = coercePrice(priceRaw);

  const legacyImages = Array.isArray(raw.images)
    ? (raw.images.map(getImageUrl).filter(Boolean) as string[])
    : undefined;

  const imagesCombined =
    gallery.length > 0
      ? gallery.map((g) => g.url)
      : legacyImages && legacyImages.length > 0
        ? legacyImages
        : image
          ? [image]
          : undefined;

  const idRaw = raw.id ?? raw._id ?? raw.productId ?? raw.sku;
  const id: string | number | undefined =
    typeof idRaw === "string" || typeof idRaw === "number" ? idRaw : undefined;

  return {
    id,
    name,
    title,
    catalogName,
    price,
    image,
    imageFront,
    imageBack,
    gallery: gallery.length > 0 ? gallery : undefined,
    images: imagesCombined,
    thumbnail: getImageUrl(raw.thumbnail),
    mockup: getImageUrl(mockupObj),
    slug:
      (typeof raw.slug === "string" && raw.slug) ||
      (typeof raw.handle === "string" && raw.handle) ||
      (typeof raw.product_slug === "string" && raw.product_slug) ||
      undefined,
    variantSize,
    variantColor,
    sku,
  };
}

export function normalizePrintroveProducts(rawResponse: unknown): PrintroveProduct[] {
  const products = extractProductsArray(rawResponse);
  return products.map((p) =>
    normalizeProduct(p && typeof p === "object" ? (p as Record<string, unknown>) : {}),
  );
}

/** Single library product: `{ status, product }` from GET /products/:id */
export function normalizePrintroveLibraryDetail(payload: unknown): PrintroveProduct | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const p = root.product;
  if (!p || typeof p !== "object") return null;
  return normalizeProduct(p as Record<string, unknown>);
}
