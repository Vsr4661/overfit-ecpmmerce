import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button, Field, Input } from "@/components/ui";
import { orderAccessToken } from "@/lib/auth";
import { findOrderForTracking } from "@/lib/orders";

export const metadata: Metadata = { title: "Track your order" };

async function lookupOrder(formData: FormData) {
  "use server";
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const email = String(formData.get("email") ?? "");
  const order = orderNumber && email ? await findOrderForTracking(orderNumber, email) : null;
  if (!order) redirect("/track?notfound=1");
  redirect(`/orders/${order.id}?t=${await orderAccessToken(order.id)}`);
}

export default function TrackPage({ searchParams }: { searchParams: { notfound?: string } }) {
  return (
    <div className="page max-w-lg pt-16">
      <h1 className="display text-5xl">Track your order</h1>
      <p className="mt-4 text-sm text-muted">
        Enter the order number from your confirmation (it starts with OVR-) and the email you used at checkout.
      </p>
      <form action={lookupOrder} className="mt-10 space-y-5">
        <Field label="Order number" htmlFor="orderNumber">
          <Input id="orderNumber" name="orderNumber" placeholder="OVR-261016-A1B2C3" required autoCapitalize="characters" />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        {searchParams.notfound && (
          <p className="text-sm text-danger" role="alert">
            We couldn&apos;t find an order with those details. Check the order number and email.
          </p>
        )}
        <Button type="submit" size="lg" className="w-full">
          Find my order
        </Button>
      </form>
    </div>
  );
}
