import { NextRequest, NextResponse } from "next/server";
import { getProductStore } from "@/lib/api-data";
import { forbiddenResponse, getRequestUser, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return unauthorizedResponse();
  if (user.role !== "ADMIN") return forbiddenResponse();
  return NextResponse.json({ products: getProductStore() });
}
