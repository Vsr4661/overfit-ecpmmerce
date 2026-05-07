import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrderStore } from "@/lib/api-data";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/api-auth";

const schema = z.object({
  status: z.enum(["PENDING", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  const user = getRequestUser(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== "ADMIN") return forbiddenResponse();

  const { orderId } = await context.params;
  const store = getOrderStore();
  const order = store.find((item) => item.id === orderId);
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  try {
    const body = await request.json();
    const { status } = schema.parse(body);
    order.status = status;
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ message: "Invalid status payload" }, { status: 400 });
  }
}
