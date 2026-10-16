import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE_NAME, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (!rateLimit(`login:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  let credentials: z.infer<typeof schema>;
  try {
    credentials = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Enter your email and password." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase() } });
  const valid = user ? await bcrypt.compare(credentials.password, user.passwordHash) : false;
  if (!user || !valid) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "ADMIN" ? ("ADMIN" as const) : ("CUSTOMER" as const),
  };
  const response = NextResponse.json({ user: sessionUser });
  response.cookies.set(AUTH_COOKIE_NAME, await createSessionToken(sessionUser), sessionCookieOptions);
  return response;
}
