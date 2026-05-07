import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieName, verifyAuthToken, type AuthUser } from "@/lib/auth";

export function getRequestUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get(getAuthCookieName())?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export function unauthorizedResponse() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}
