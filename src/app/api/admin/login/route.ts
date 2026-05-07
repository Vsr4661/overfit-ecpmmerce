import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthToken, getAuthCookieName } from "@/lib/auth";
import { getUserStore } from "@/lib/api-data";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = schema.parse(body);
    const user = getUserStore().find(
      (entry) =>
        entry.email.toLowerCase() === email.toLowerCase() &&
        entry.password === password &&
        entry.role === "ADMIN",
    );
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    const response = NextResponse.json({ message: "Logged in" });
    response.cookies.set(getAuthCookieName(), createAuthToken(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set("overfit_admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ message: "Unable to login" }, { status: 400 });
  }
}
