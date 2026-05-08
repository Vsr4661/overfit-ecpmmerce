import { NextResponse } from "next/server";
import { getCategories } from "@/lib/printrove";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[Printrove API] GET /api/printrove/categories error", error);
    return NextResponse.json(
      { error: (error as Error).message || "Unable to fetch Printrove categories." },
      { status: 500 }
    );
  }
}
