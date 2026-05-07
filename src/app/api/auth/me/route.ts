import { NextRequest, NextResponse } from "next/server";
import { getRequestUser, unauthorizedResponse } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return unauthorizedResponse();
  return NextResponse.json({ user });
}
