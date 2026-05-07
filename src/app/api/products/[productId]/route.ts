import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProductStore } from "@/lib/api-data";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/api-auth";

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().min(8).optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  category: z.string().min(2).optional(),
  inventory: z.number().int().min(0).optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  const { productId } = await context.params;
  const product = getProductStore().find((item) => item.id === productId);
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  const user = getRequestUser(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== "ADMIN") return forbiddenResponse();

  const { productId } = await context.params;
  const store = getProductStore();
  const index = store.findIndex((item) => item.id === productId);
  if (index === -1) return NextResponse.json({ message: "Product not found" }, { status: 404 });

  try {
    const body = await request.json();
    const data = updateProductSchema.parse(body);
    store[index] = { ...store[index], ...data };
    return NextResponse.json({ product: store[index] });
  } catch {
    return NextResponse.json({ message: "Invalid update payload" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  const user = getRequestUser(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== "ADMIN") return forbiddenResponse();

  const { productId } = await context.params;
  const store = getProductStore();
  const index = store.findIndex((item) => item.id === productId);
  if (index === -1) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  const [deleted] = store.splice(index, 1);
  return NextResponse.json({ message: "Deleted", product: deleted });
}
