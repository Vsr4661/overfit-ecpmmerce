import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken, type AuthUser } from "@/lib/auth";

export async function getRequestUser(request: NextRequest): Promise<AuthUser | null> {
  return verifySessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
}

/** For server components: the signed-in user from the session cookie. */
export async function getSessionUser(): Promise<AuthUser | null> {
  return verifySessionToken(cookies().get(AUTH_COOKIE_NAME)?.value);
}

/** Returns an error response unless the request comes from an admin. */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const user = await getRequestUser(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  return null;
}
