/** Single source of truth for shipping, shared by client UI and server order creation. */
export const FREE_SHIPPING_THRESHOLD = 2999;
export const FLAT_SHIPPING_FEE = 99;

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

/** Free-shipping threshold applies to the subtotal after any discount. */
export function orderTotals(subtotal: number, discount = 0) {
  const discountAmount = Math.min(Math.max(0, discount), subtotal);
  const afterDiscount = subtotal - discountAmount;
  const shippingFee = shippingFor(afterDiscount);
  return { subtotal, discountAmount, shippingFee, total: afterDiscount + shippingFee };
}

export type DiscountRule = {
  code: string;
  type: string;
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
};

export type DiscountResult = { ok: true; amount: number } | { ok: false; reason: string };

/** Whole-rupee discount for a subtotal, or why the code can't be used. */
export function evaluateDiscount(rule: DiscountRule, subtotal: number, now = new Date()): DiscountResult {
  if (!rule.isActive) return { ok: false, reason: "This code is no longer active." };
  if (rule.expiresAt && rule.expiresAt < now) return { ok: false, reason: "This code has expired." };
  if (rule.maxUses !== null && rule.usedCount >= rule.maxUses) {
    return { ok: false, reason: "This code has reached its usage limit." };
  }
  if (subtotal < rule.minSubtotal) {
    return { ok: false, reason: `Spend at least ₹${rule.minSubtotal.toLocaleString("en-IN")} to use this code.` };
  }
  const raw = rule.type === "PERCENT" ? (subtotal * rule.value) / 100 : rule.value;
  return { ok: true, amount: Math.min(subtotal, Math.floor(raw)) };
}

export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function parseSizes(sizes: string) {
  return sizes
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
}
