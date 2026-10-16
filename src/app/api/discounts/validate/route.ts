import { NextResponse } from "next/server";
import { z } from "zod";
import { applyDiscountCode } from "@/lib/orders";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ code: z.string().trim().min(1).max(40), subtotal: z.number().nonnegative() });

/** Preview only — checkout re-validates the code against the server-computed subtotal. */
export async function POST(request: Request) {
  if (!rateLimit(`discount:${clientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
  }
  let input: z.infer<typeof schema>;
  try {
    input = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Enter a code." }, { status: 400 });
  }
  const result = await applyDiscountCode(input.code, input.subtotal);
  if (!result.ok) return NextResponse.json({ message: result.reason }, { status: 422 });
  return NextResponse.json({ code: result.code, amount: result.amount });
}
