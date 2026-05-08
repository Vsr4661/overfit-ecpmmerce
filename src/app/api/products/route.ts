import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/store";
import { getProductStore } from "@/lib/api-data";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/api-auth";

const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(8),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  category: z.string().min(2),
  inventory: z.number().int().min(0),
});

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== "ADMIN") return forbiddenResponse();

  try {
    const body = await request.json();
    const data = createProductSchema.parse(body);
    const store = getProductStore();
    const created = {
      id: `prod_${Date.now()}`,
      ...data,
    };
    store.unshift(created);
    return NextResponse.json({ product: created }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid product payload" }, { status: 400 });
  }
}
