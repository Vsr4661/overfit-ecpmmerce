import { NextResponse } from "next/server";
import { z } from "zod";
import { LoginError, requestLoginCode } from "@/lib/customers";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().trim().email().max(200) });

/** Emails a sign-in code. Responds the same whether or not an account exists. */
export async function POST(request: Request) {
  if (!rateLimit(`login-code:${clientIp(request)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Enter a valid email." }, { status: 400 });
  }

  try {
    await requestLoginCode(body.email);
  } catch (error) {
    if (error instanceof LoginError) return NextResponse.json({ message: error.message }, { status: 429 });
    console.error("[login-code] could not send", (error as Error).message);
    return NextResponse.json({ message: "We couldn't send the code. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
