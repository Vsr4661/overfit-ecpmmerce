import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-auth";
import { normalizeCode } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9_-]{3,30}$/, "Use 3–30 letters, numbers, - or _"),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.number().positive(),
    minSubtotal: z.number().min(0).default(0),
    maxUses: z.number().int().positive().nullable().default(null),
    expiresAt: z.string().datetime().nullable().default(null),
  })
  .refine((data) => data.type !== "PERCENT" || data.value <= 90, {
    message: "Percentage discounts can be at most 90%",
    path: ["value"],
  });

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await request.json());
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : "Invalid payload";
    return NextResponse.json({ message }, { status: 400 });
  }

  const code = normalizeCode(data.code);
  if (await prisma.discountCode.findUnique({ where: { code } })) {
    return NextResponse.json({ message: `${code} already exists.` }, { status: 409 });
  }
  const created = await prisma.discountCode.create({
    data: { ...data, code, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
  });
  return NextResponse.json({ discount: created }, { status: 201 });
}
