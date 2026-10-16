"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { OrderTotals } from "@/components/store/order-summary";
import { Button, Field, Input, Price, ProductImage, Select, buttonClasses } from "@/components/ui";
import { INDIAN_MOBILE, INDIAN_PIN, INDIAN_STATES } from "@/lib/india";

type Form = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

const EMPTY: Form = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

function validate(form: Form) {
  const errors: Partial<Record<keyof Form, string>> = {};
  if (form.customerName.trim().length < 2) errors.customerName = "Enter your full name";
  if (!/^\S+@\S+\.\S+$/.test(form.customerEmail.trim())) errors.customerEmail = "Enter a valid email";
  if (!INDIAN_MOBILE.test(form.customerPhone.trim()))
    errors.customerPhone = "Enter a 10-digit mobile number";
  if (form.addressLine1.trim().length < 5) errors.addressLine1 = "Enter your street address";
  if (form.city.trim().length < 2) errors.city = "Enter your city";
  if (!form.state) errors.state = "Choose your state";
  if (!INDIAN_PIN.test(form.postalCode.trim())) errors.postalCode = "Enter a 6-digit PIN code";
  return errors;
}

type CheckoutResponse = {
  mode: "test" | "razorpay";
  orderId: string;
  trackingUrl: string;
  razorpay?: { keyId: string; orderId: string; amount: number; currency: string };
  message?: string;
};

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };
  }
}

/** `saved` pre-fills the form from a signed-in customer's profile. */
export function CheckoutForm({
  paymentsLive,
  testMode,
  saved,
}: {
  paymentsLive: boolean;
  testMode: boolean;
  saved?: Form | null;
}) {
  const checkoutOpen = paymentsLive || testMode;
  const router = useRouter();
  const { items, hydrated, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<Form>(saved ?? EMPTY);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [codeError, setCodeError] = useState("");
  const [applying, setApplying] = useState(false);

  const errors = touched ? validate(form) : {};

  const field = (name: keyof Form) => ({
    id: name,
    name,
    value: form[name],
    "aria-invalid": Boolean(errors[name]),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [name]: event.target.value })),
  });

  const applyCode = async (code = codeInput) => {
    if (!code.trim()) return;
    setApplying(true);
    setCodeError("");
    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Code not valid");
      setDiscount({ code: data.code, amount: data.amount });
      setCodeInput("");
    } catch (caught) {
      setDiscount(null);
      setCodeError((caught as Error).message);
    } finally {
      setApplying(false);
    }
  };

  // Percent codes and minimum-spend rules depend on the subtotal, so re-check when it changes.
  const appliedCode = discount?.code;
  useEffect(() => {
    if (appliedCode) applyCode(appliedCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const finish = (trackingUrl: string) => {
    clearCart();
    router.push(`${trackingUrl}&placed=1`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    setError("");
    if (Object.keys(validate(form)).length > 0) {
      document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          country: "India",
          discountCode: discount?.code,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, size: item.size })),
        }),
      });
      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok) throw new Error(data.message ?? "Could not place your order.");

      if (data.mode === "test" || !data.razorpay) {
        finish(data.trackingUrl);
        return;
      }

      if (!window.Razorpay) throw new Error("Payment window failed to load. Check your connection and retry.");
      const checkout = new window.Razorpay({
        key: data.razorpay.keyId,
        order_id: data.razorpay.orderId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: "Overfit",
        description: `Order for ${form.customerName}`,
        prefill: { name: form.customerName, email: form.customerEmail, contact: form.customerPhone },
        theme: { color: "#111111" },
        handler: async (payment: RazorpaySuccess) => {
          // Even if this verification call fails, the Razorpay webhook can still confirm the
          // payment; the order page shows the real status either way.
          await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId, ...payment }),
          }).catch(() => {});
          finish(data.trackingUrl);
        },
        modal: { ondismiss: () => setSubmitting(false) },
      });
      checkout.on("payment.failed", () => {
        setSubmitting(false);
        setError("Payment failed. No money was taken — please try again.");
      });
      checkout.open();
    } catch (caught) {
      setError((caught as Error).message);
      setSubmitting(false);
    }
  };

  if (!hydrated) return <div className="page min-h-[60vh] pt-10" aria-busy="true" />;

  if (items.length === 0) {
    return (
      <div className="page flex min-h-[50vh] flex-col items-center justify-center gap-6 pt-10 text-center">
        <h1 className="display text-5xl">Nothing to check out</h1>
        <Link href="/shop" className={buttonClasses("primary", "lg")}>
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="page pt-10">
      {paymentsLive && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />}
      <h1 className="display text-5xl sm:text-6xl">Checkout</h1>

      {!checkoutOpen && (
        <p className="mt-6 border border-accent bg-accent/10 p-3 text-sm" role="status">
          <strong>Checkout isn&apos;t open yet.</strong> Online payments haven&apos;t been set up, so orders can&apos;t be
          placed right now. You can still browse and build your cart.
        </p>
      )}

      {testMode && (
        <p className="mt-6 border border-accent bg-accent/10 p-3 text-sm">
          <strong>Test mode:</strong> Razorpay keys aren&apos;t configured, so orders are marked paid without charging.
          Add <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> to take real payments.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-10 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <section className="space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em]">Contact</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="customerName" error={errors.customerName} className="sm:col-span-2">
                <Input autoComplete="name" {...field("customerName")} />
              </Field>
              <Field label="Email" htmlFor="customerEmail" error={errors.customerEmail} hint="For your order confirmation">
                <Input type="email" autoComplete="email" {...field("customerEmail")} />
              </Field>
              <Field label="Mobile" htmlFor="customerPhone" error={errors.customerPhone} hint="For delivery updates">
                <Input type="tel" inputMode="tel" autoComplete="tel" {...field("customerPhone")} />
              </Field>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em]">Delivery address</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Address" htmlFor="addressLine1" error={errors.addressLine1} className="sm:col-span-2">
                <Input autoComplete="address-line1" placeholder="House no., street, area" {...field("addressLine1")} />
              </Field>
              <Field label="Apartment, landmark (optional)" htmlFor="addressLine2" className="sm:col-span-2">
                <Input autoComplete="address-line2" {...field("addressLine2")} />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city}>
                <Input autoComplete="address-level2" {...field("city")} />
              </Field>
              <Field label="PIN code" htmlFor="postalCode" error={errors.postalCode}>
                <Input inputMode="numeric" maxLength={6} autoComplete="postal-code" {...field("postalCode")} />
              </Field>
              <Field label="State" htmlFor="state" error={errors.state} className="sm:col-span-2">
                <Select autoComplete="address-level1" {...field("state")}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <p className="text-xs text-muted">We currently ship within India only.</p>
          </section>
        </div>

        <aside className="h-fit space-y-6 bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em]">Your order</h2>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-paper">
                  <ProductImage src={item.imageUrl} alt={item.name} sizes="56px" />
                  <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center bg-ink px-1 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{item.name}</p>
                  {item.size && <p className="text-xs text-muted">Size {item.size}</p>}
                </div>
                <Price amount={item.price * item.quantity} className="text-sm" />
              </li>
            ))}
          </ul>
          {discount ? (
            <div className="flex items-center justify-between border border-dashed border-success bg-success/5 px-3 py-2 text-sm">
              <span>
                <span className="font-mono font-semibold">{discount.code}</span> applied
              </span>
              <button type="button" className="text-xs text-muted underline" onClick={() => setDiscount(null)}>
                Remove
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <Input
                  aria-label="Discount code"
                  placeholder="Discount code"
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applyCode();
                    }
                  }}
                  className="uppercase placeholder:normal-case"
                />
                <Button variant="secondary" onClick={() => applyCode()} disabled={applying || !codeInput.trim()}>
                  Apply
                </Button>
              </div>
              {codeError && (
                <p className="mt-1.5 text-xs text-danger" role="alert">
                  {codeError}
                </p>
              )}
            </div>
          )}
          <OrderTotals subtotal={subtotal} discount={discount ?? undefined} />

          {error && (
            <p className="border border-danger bg-danger/5 p-3 text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={submitting || !checkoutOpen}>
            <Lock className="h-4 w-4" />
            {submitting
              ? "Processing…"
              : paymentsLive
                ? "Pay securely"
                : testMode
                  ? "Place test order"
                  : "Checkout unavailable"}
          </Button>
          <p className="text-center text-xs text-muted">
            By placing this order you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link>,{" "}
            <Link href="/refunds" className="underline">Refund policy</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy policy</Link>.
          </p>
        </aside>
      </form>
    </div>
  );
}
