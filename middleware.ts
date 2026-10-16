import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const user = await verifySessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  if (user?.role === "ADMIN") return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
