"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/utils";

type RazorpayResponse = {
  id: string;
  amount: number;
  currency: string;
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const shipping = items.length > 0 ? 99 : 0;
  const total = subtotal + shipping;
  const isFormValid =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.addressLine1 &&
    form.city &&
    form.state &&
    form.postalCode &&
    form.country;

  const handleInputChange =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handlePay = async () => {
    if (items.length === 0 || !isFormValid) return;
    setLoading(true);
    try {
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const data = (await response.json()) as RazorpayResponse;
      alert(`Order placed. Razorpay order created: ${data.id}`);
      clearCart();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">Checkout</h1>
          <p className="mt-1 text-sm text-zinc-600">Enter customer and shipping details below.</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Customer Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              value={form.firstName}
              onChange={handleInputChange("firstName")}
              className="rounded border border-zinc-300 p-2 text-sm"
              placeholder="First name"
            />
            <input
              value={form.lastName}
              onChange={handleInputChange("lastName")}
              className="rounded border border-zinc-300 p-2 text-sm"
              placeholder="Last name"
            />
            <input
              type="email"
              value={form.email}
              onChange={handleInputChange("email")}
              className="rounded border border-zinc-300 p-2 text-sm"
              placeholder="Email address"
            />
            <input
              value={form.phone}
              onChange={handleInputChange("phone")}
              className="rounded border border-zinc-300 p-2 text-sm"
              placeholder="Phone number"
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              value={form.addressLine1}
              onChange={handleInputChange("addressLine1")}
              className="sm:col-span-2 rounded border border-zinc-300 p-2 text-sm"
              placeholder="Address line 1"
            />
            <input
              value={form.addressLine2}
              onChange={handleInputChange("addressLine2")}
              className="sm:col-span-2 rounded border border-zinc-300 p-2 text-sm"
              placeholder="Address line 2 (optional)"
            />
            <input
              value={form.city}
              onChange={handleInputChange("city")}
              className="rounded border border-zinc-300 p-2 text-sm"
              placeholder="City"
            />
            <input
              value={form.state}
              onChange={handleInputChange("state")}
              className="rounded border border-zinc-300 p-2 text-sm"
              placeholder="State"
            />
            <input
              value={form.postalCode}
              onChange={handleInputChange("postalCode")}
              className="rounded border border-zinc-300 p-2 text-sm"
              placeholder="Postal code"
            />
            <input
              value={form.country}
              onChange={handleInputChange("country")}
              className="rounded border border-zinc-300 p-2 text-sm"
              placeholder="Country"
            />
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-zinc-200">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-zinc-500">
                    Size: {item.size ?? "M"} | Qty: {item.quantity}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between font-semibold text-zinc-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h3 className="text-base font-semibold">Payment</h3>
          <p className="mt-1 text-sm text-zinc-600">
            Razorpay secure checkout will open after placing your order.
          </p>
          <div className="mt-4 rounded-md border border-zinc-300 bg-zinc-50 p-3 text-sm">
            Method: Razorpay (UPI, Cards, Netbanking, Wallets)
          </div>
          <button
            onClick={handlePay}
            disabled={loading || items.length === 0 || !isFormValid}
            className="mt-5 w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </aside>
    </div>
  );
}
