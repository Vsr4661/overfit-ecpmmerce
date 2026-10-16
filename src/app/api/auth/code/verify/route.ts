import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE_NAME, CUSTOMER_SESSION_TTL_SECONDS, createSessionToken, customerSessionCookieOptions } from "@/lib/auth";
import { LoginError, verifyLoginCode } from "@/lib/customers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email().max(200),
  code: z.string().trim().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  if (!rateLimit(`login-verify:${clientIp(request)}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  let user;
  try {
    user = await verifyLoginCode(body.email, body.code);
  } catch (error) {
    if (error instanceof LoginError) return NextResponse.json({ message: error.message }, { status: 401 });
    throw error;
  }

  const response = NextResponse.json({ user });
  response.cookies.set(
    AUTH_COOKIE_NAME,
    await createSessionToken(user, CUSTOMER_SESSION_TTL_SECONDS),
    customerSessionCookieOptions,
  );
  return response;
}
