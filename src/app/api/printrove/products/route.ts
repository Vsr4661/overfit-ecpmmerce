import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/printrove";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const products = await getProducts(params);
    return NextResponse.json({ products, query: params });
  } catch (error) {
    console.error("[Printrove API] GET /api/printrove/products error", error);
    return NextResponse.json(
      { error: (error as Error).message || "Unable to fetch Printrove products." },
      { status: 500 }
    );
  }
}
