import { Product, Order } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "prod_1",
    name: "Overfit Cargo Jacket",
    slug: "overfit-cargo-jacket",
    description: "Techwear inspired oversized jacket with weather-resistant shell.",
    price: 4499,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1400",
    category: "Outerwear",
    inventory: 18,
  },
  {
    id: "prod_2",
    name: "Signature Heavy Tee",
    slug: "signature-heavy-tee",
    description: "240 GSM cotton oversized t-shirt with minimal front branding.",
    price: 1299,
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1400",
    category: "T-Shirts",
    inventory: 64,
  },
  {
    id: "prod_3",
    name: "Relaxed Utility Pants",
    slug: "relaxed-utility-pants",
    description: "Tapered utility pants with hidden pockets and articulated knees.",
    price: 2899,
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=1400",
    category: "Bottomwear",
    inventory: 31,
  },
  {
    id: "prod_4",
    name: "Monochrome Hoodie",
    slug: "monochrome-hoodie",
    description: "Brushed fleece hoodie designed for oversized layering.",
    price: 2499,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a9fbc4f79b2?w=1400",
    category: "Hoodies",
    inventory: 42,
  },
];

export const mockOrders: Order[] = [
  {
    id: "ord_1",
    orderNumber: "OVR-2026-1001",
    customerName: "Aarav Kapoor",
    customerEmail: "aarav@example.com",
    shippingAddress: "Bandra West, Mumbai",
    subtotal: 5798,
    shippingFee: 99,
    total: 5897,
    status: "SHIPPED",
    createdAt: new Date().toISOString(),
    items: [
      { id: "ord_1_item_1", product: mockProducts[1], quantity: 1, size: "M" },
      { id: "ord_1_item_2", product: mockProducts[2], quantity: 1, size: "L" },
    ],
  },
];
