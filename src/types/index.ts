export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inventory: number;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
};

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: CartItem[];
};
