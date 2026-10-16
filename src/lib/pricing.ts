/** Single source of truth for shipping, shared by client UI and server order creation. */
export const FREE_SHIPPING_THRESHOLD = 2999;
export const FLAT_SHIPPING_FEE = 99;

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

export function orderTotals(subtotal: number) {
  const shippingFee = shippingFor(subtotal);
  return { subtotal, shippingFee, total: subtotal + shippingFee };
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
