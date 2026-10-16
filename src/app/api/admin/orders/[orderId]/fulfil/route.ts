import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { fulfilWithPrintrove } from "@/lib/orders";
import { isPrintroveConfigured } from "@/lib/printrove";
import { prisma } from "@/lib/prisma";

/** Retry sending a paid order to Printrove. */
export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isPrintroveConfigured()) {
    return NextResponse.json({ message: "PRINTROVE_TOKEN is not set." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.orderId } });
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  if (order.status === "PENDING" || order.status === "CANCELLED") {
    return NextResponse.json({ message: "Only paid orders can be fulfilled." }, { status: 409 });
  }

  await fulfilWithPrintrove(order.id);
  const after = await prisma.order.findUnique({
    where: { id: order.id },
    select: { printroveOrderId: true, fulfilmentError: true },
  });
  if (after?.printroveOrderId) return NextResponse.json(after);
  return NextResponse.json(
    { message: after?.fulfilmentError ?? "This order has no Printrove products to send." },
    { status: after?.fulfilmentError ? 502 : 400 },
  );
}
