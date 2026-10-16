import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ isActive: z.boolean() });

export async function PATCH(request: NextRequest, { params }: { params: { discountId: string } }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
  const result = await prisma.discountCode.updateMany({ where: { id: params.discountId }, data });
  if (result.count === 0) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
