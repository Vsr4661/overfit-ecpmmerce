import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { isPrintroveConfigured } from "@/lib/printrove";
import { syncPrintroveCatalog } from "@/lib/printrove-sync";

// Vercel Hobby caps functions at 60s; for large libraries use `npm run sync:printrove` instead.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  if (!isPrintroveConfigured()) {
    return NextResponse.json({ message: "Add PRINTROVE_TOKEN to .env first." }, { status: 400 });
  }
  try {
    return NextResponse.json(await syncPrintroveCatalog());
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 502 });
  }
}
