import "server-only";
import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { orderTotals, parseSizes, type OrderStatus } from "@/lib/pricing";
import { submitPrintroveOrder, isPrintroveAutoFulfilEnabled } from "@/lib/printrove";
import type { Order } from "@/types";

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  items: { productId: string; quantity: number; size?: string }[];
};

export class CheckoutError extends Error {}

function newOrderNumber() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `OVR-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/** Creates a PENDING order, pricing every line from the database (never from the client). */
export async function createPendingOrder(input: CheckoutInput) {
  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines = input.items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) throw new CheckoutError("An item in your cart is no longer available.");
    const sizes = parseSizes(product.sizes);
    if (sizes.length > 0 && (!item.size || !sizes.includes(item.size))) {
      throw new CheckoutError(`Please choose a valid size for ${product.name}.`);
    }
    if (product.inventory < item.quantity) {
      throw new CheckoutError(`Only ${product.inventory} left of ${product.name}.`);
    }
    return { product, quantity: item.quantity, size: sizes.length > 0 ? item.size : null };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const { shippingFee, total } = orderTotals(subtotal);

  return prisma.order.create({
    data: {
      orderNumber: newOrderNumber(),
      status: "PENDING",
      subtotal,
      shippingFee,
      total,
      customerName: input.customerName,
      customerEmail: input.customerEmail.toLowerCase(),
      customerPhone: input.customerPhone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 || null,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      items: {
        create: lines.map((line) => ({
          productId: line.product.id,
          productName: line.product.name,
          imageUrl: line.product.imageUrl,
          unitPrice: line.product.price,
          quantity: line.quantity,
          size: line.size,
          color: line.product.color,
        })),
      },
    },
  });
}

/**
 * Marks an order paid and decrements stock exactly once (safe to call from both the
 * checkout callback and the webhook). Returns true if this call performed the transition.
 */
export async function markOrderPaid(orderId: string, razorpayPaymentId: string | null) {
  const transitioned = await prisma.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "PAID", paidAt: new Date(), razorpayPaymentId },
    });
    if (count === 0) return false;
    const items = await tx.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { decrement: item.quantity } },
      });
    }
    return true;
  });

  if (transitioned && isPrintroveAutoFulfilEnabled()) {
    await fulfilWithPrintrove(orderId);
  }
  return transitioned;
}

type StoredVariant = { id: number; size?: string };

function pickVariant(raw: string | null, size: string | null): StoredVariant | undefined {
  if (!raw) return undefined;
  try {
    const variants = JSON.parse(raw) as StoredVariant[];
    return variants.find((variant) => !size || variant.size === size) ?? variants[0];
  } catch {
    return undefined;
  }
}

/** Sends the Printrove-backed lines of a paid order to Printrove. Errors are recorded, not thrown. */
export async function fulfilWithPrintrove(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.printroveOrderId) return;

  try {
    const lines = order.items
      .filter((item) => item.product.printroveId)
      .map((item) => {
        const variant = pickVariant(item.product.printroveVariants, item.size);
        if (!variant) throw new Error(`No Printrove variant for ${item.productName} (${item.size ?? "one size"}).`);
        return { variantId: variant.id, quantity: item.quantity };
      });
    if (lines.length === 0) return;

    const result = await submitPrintroveOrder({
      reference: order.orderNumber,
      retailPrice: order.total,
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
        address1: order.addressLine1,
        address2: order.addressLine2 ?? undefined,
        city: order.city,
        state: order.state,
        pincode: order.postalCode,
        country: order.country,
      },
      lines,
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { printroveOrderId: result.id, fulfilmentError: null },
    });
  } catch (error) {
    // Payment already succeeded; keep the error so the admin can see it and retry.
    await prisma.order.update({
      where: { id: orderId },
      data: { fulfilmentError: (error as Error).message.slice(0, 500) },
    });
  }
}

const orderInclude = { items: { include: { product: { select: { slug: true } } } } } as const;
type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function toOrderView(order: OrderRow): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as OrderStatus,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: [
      order.addressLine1,
      order.addressLine2,
      `${order.city}, ${order.state} ${order.postalCode}`,
      order.country,
    ]
      .filter(Boolean)
      .join(", "),
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      slug: item.product.slug,
      imageUrl: item.imageUrl,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    })),
  };
}

export async function getOrderView(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
  return order ? toOrderView(order) : null;
}

export async function findOrderForTracking(orderNumber: string, email: string) {
  return prisma.order.findFirst({
    where: { orderNumber: orderNumber.trim().toUpperCase(), customerEmail: email.trim().toLowerCase() },
    select: { id: true },
  });
}

export async function listOrders(take = 100) {
  const orders = await prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return orders.map(toOrderView);
}
