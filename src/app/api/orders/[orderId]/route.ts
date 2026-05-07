import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;
  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
