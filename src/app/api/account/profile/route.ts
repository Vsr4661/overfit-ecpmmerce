import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/api-auth";
import { updateCustomerProfile } from "@/lib/customers";
import { INDIAN_MOBILE, INDIAN_PIN, INDIAN_STATES } from "@/lib/india";

const optional = (max: number) => z.string().trim().max(max).default("");

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(100),
    phone: optional(20).refine((value) => !value || INDIAN_MOBILE.test(value), "Enter a 10-digit mobile number"),
    addressLine1: optional(200),
    addressLine2: optional(200),
    city: optional(100),
    state: optional(100).refine((value) => !value || INDIAN_STATES.includes(value), "Choose your state"),
    postalCode: optional(6).refine((value) => !value || INDIAN_PIN.test(value), "Enter a 6-digit PIN code"),
  })
  .superRefine((profile, ctx) => {
    // The address is optional, but a half-filled one would break checkout pre-fill.
    const { addressLine1, addressLine2, city, state, postalCode } = profile;
    if (![addressLine1, addressLine2, city, state, postalCode].some(Boolean)) return;
    if (addressLine1.length < 5) ctx.addIssue({ code: "custom", path: ["addressLine1"], message: "Enter your street address" });
    if (city.length < 2) ctx.addIssue({ code: "custom", path: ["city"], message: "Enter your city" });
    if (!state) ctx.addIssue({ code: "custom", path: ["state"], message: "Choose your state" });
    if (!postalCode) ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Enter a 6-digit PIN code" });
  });

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (user?.role !== "CUSTOMER") return NextResponse.json({ message: "Sign in to update your profile." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message]));
    return NextResponse.json({ message: "Check the highlighted fields.", fieldErrors }, { status: 400 });
  }

  await updateCustomerProfile(user.id, parsed.data);
  return NextResponse.json({ ok: true });
}
