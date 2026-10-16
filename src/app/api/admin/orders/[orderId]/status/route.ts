import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { ORDER_STATUSES } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

const schema = z.object({ status: z.enum(ORDER_STATUSES) });

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let status: z.infer<typeof schema>["status"];
  try {
    status = schema.parse(await request.json()).status;
  } catch {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.orderId } });
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
  if (order.status === "PENDING" && status !== "CANCELLED") {
    return NextResponse.json(
      { message: "Unpaid orders can only be cancelled. Payment status is set by Razorpay." },
      { status: 409 },
    );
  }

  const updated = await prisma.order.update({ where: { id: order.id }, data: { status } });
  return NextResponse.json({ order: { id: updated.id, status: updated.status } });
}
