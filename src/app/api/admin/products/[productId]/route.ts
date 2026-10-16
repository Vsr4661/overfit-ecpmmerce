import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(8).max(2000),
    price: z.number().positive().max(1_000_000),
    inventory: z.number().int().min(0).max(100_000),
    isActive: z.boolean(),
  })
  .partial();

export async function PATCH(request: NextRequest, { params }: { params: { productId: string } }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await request.json());
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : "Invalid payload";
    return NextResponse.json({ message }, { status: 400 });
  }

  const exists = await prisma.product.findUnique({ where: { id: params.productId }, select: { id: true } });
  if (!exists) return NextResponse.json({ message: "Product not found" }, { status: 404 });

  const product = await prisma.product.update({ where: { id: params.productId }, data });
  return NextResponse.json({ product });
}
