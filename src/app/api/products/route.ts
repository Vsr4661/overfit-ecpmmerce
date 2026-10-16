import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ products: await getProducts() });
}
