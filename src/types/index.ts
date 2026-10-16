import type { OrderStatus } from "@/lib/pricing";

export type { OrderStatus };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  imageBackUrl: string | null;
  category: string;
  categorySlug: string;
  sizes: string[];
  color: string | null;
  inventory: number;
};

/** Cart lines live in localStorage; price is display-only — the server re-prices at checkout. */
export type CartItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
};

export type OrderItemView = {
  id: string;
  productName: string;
  slug: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  size: string | null;
  color: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  paidAt: string | null;
  items: OrderItemView[];
};
