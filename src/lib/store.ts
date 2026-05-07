import { prisma } from "@/lib/prisma";
import { mockOrders, mockProducts } from "@/lib/mock-data";
import { Order, Product } from "@/types";

function prismaProductToProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: { toNumber: () => number };
  imageUrl: string;
  inventory: number;
  category: { name: string };
}): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toNumber(),
    imageUrl: product.imageUrl,
    category: product.category.name,
    inventory: product.inventory,
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    if (products.length === 0) return mockProducts;
    return products.map(prismaProductToProduct);
  } catch {
    return mockProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    return product ? prismaProductToProduct(product) : null;
  } catch {
    return mockProducts.find((item) => item.slug === slug) ?? null;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: { include: { category: true } } } } },
    });

    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      subtotal: order.subtotal.toNumber(),
      shippingFee: order.shippingFee.toNumber(),
      total: order.total.toNumber(),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item: (typeof order.items)[number]) => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          description: item.product.description,
          price: item.product.price.toNumber(),
          imageUrl: item.product.imageUrl,
          category: item.product.category.name,
          inventory: item.product.inventory,
        },
        quantity: item.quantity,
        size: "M",
      })),
    };
  } catch {
    return mockOrders.find((item) => item.id === orderId) ?? null;
  }
}
