import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrderStore } from "@/lib/api-data";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/api-auth";

const createOrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  shippingAddress: z.string().min(8),
  items: z
    .array(
      z.object({
        id: z.string(),
        product: z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          description: z.string(),
          price: z.number(),
          imageUrl: z.string(),
          category: z.string(),
          inventory: z.number(),
        }),
        quantity: z.number().int().min(1),
        size: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = createOrderSchema.parse(body);
    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const shippingFee = subtotal > 2999 ? 0 : 99;
    const total = subtotal + shippingFee;

    const created = {
      id: `ord_${Date.now()}`,
      orderNumber: `OVR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      shippingAddress: payload.shippingAddress,
      subtotal,
      shippingFee,
      total,
      status: "PENDING" as const,
      createdAt: new Date().toISOString(),
      items: payload.items,
    };

    getOrderStore().unshift(created);
    return NextResponse.json({ message: "Order created", order: created }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid order payload" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== "ADMIN") return forbiddenResponse();
  return NextResponse.json({ orders: getOrderStore() });
}
