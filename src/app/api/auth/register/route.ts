import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthToken, getAuthCookieName } from "@/lib/auth";
import { getUserStore } from "@/lib/api-data";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = schema.parse(body);
    const users = getUserStore();

    const existing = users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const user = {
      id: `usr_${Date.now()}`,
      name: payload.name,
      email: payload.email.toLowerCase(),
      password: payload.password,
      role: "CUSTOMER" as const,
    };
    users.push(user);

    const token = createAuthToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({ message: "Registered", user: { ...user, password: undefined } }, { status: 201 });
    response.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
}
