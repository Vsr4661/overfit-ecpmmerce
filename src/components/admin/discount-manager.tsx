"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminHeading } from "@/components/admin/admin-heading";
import { Badge, Button, Field, Input, Price, Select } from "@/components/ui";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export type AdminDiscount = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  revenue: number;
  discounted: number;
};

const EMPTY = { code: "", type: "PERCENT", value: "", minSubtotal: "", maxUses: "", expiresOn: "" };

function describe(discount: AdminDiscount) {
  const off = discount.type === "PERCENT" ? `${discount.value}% off` : `${formatCurrency(discount.value)} off`;
  return discount.minSubtotal > 0 ? `${off} orders over ${formatCurrency(discount.minSubtotal)}` : off;
}

export function DiscountManager({ codes }: { codes: AdminDiscount[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof EMPTY) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          // End of the chosen day, India time.
          expiresAt: form.expiresOn ? new Date(`${form.expiresOn}T23:59:59+05:30`).toISOString() : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Could not create code");
      setForm(EMPTY);
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (discount: AdminDiscount) => {
    await fetch(`/api/admin/discounts/${discount.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !discount.isActive }),
    });
    router.refresh();
  };

  return (
    <div className="max-w-5xl">
      <AdminHeading title="Discount codes" />

      <form onSubmit={create} className="mb-8 grid gap-4 bg-surface p-5 sm:grid-cols-3 lg:grid-cols-6">
        <Field label="Code" htmlFor="code" className="sm:col-span-1 lg:col-span-2">
          <Input id="code" required value={form.code} onChange={set("code")} placeholder="WELCOME10" className="uppercase" />
        </Field>
        <Field label="Type" htmlFor="type">
          <Select id="type" value={form.type} onChange={set("type")}>
            <option value="PERCENT">% off</option>
            <option value="FIXED">₹ off</option>
          </Select>
        </Field>
        <Field label={form.type === "PERCENT" ? "Percent" : "Amount (₹)"} htmlFor="value">
          <Input id="value" type="number" min={1} max={form.type === "PERCENT" ? 90 : undefined} required value={form.value} onChange={set("value")} />
        </Field>
        <Field label="Min. order (₹)" htmlFor="minSubtotal">
          <Input id="minSubtotal" type="number" min={0} value={form.minSubtotal} onChange={set("minSubtotal")} placeholder="0" />
        </Field>
        <Field label="Max uses" htmlFor="maxUses">
          <Input id="maxUses" type="number" min={1} value={form.maxUses} onChange={set("maxUses")} placeholder="∞" />
        </Field>
        <Field label="Expires on" htmlFor="expiresOn" className="lg:col-span-2">
          <Input id="expiresOn" type="date" value={form.expiresOn} onChange={set("expiresOn")} />
        </Field>
        <div className="flex items-end lg:col-span-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create code"}
          </Button>
          {error && (
            <p className="ml-4 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
        </div>
      </form>

      <div className="overflow-x-auto bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="label">
            <tr>
              <th className="p-3 font-semibold">Code</th>
              <th className="p-3 font-semibold">Uses</th>
              <th className="p-3 font-semibold">Sales with code</th>
              <th className="p-3 font-semibold">Expires</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {codes.map((discount) => {
              const expired = discount.expiresAt !== null && new Date(discount.expiresAt) < new Date();
              const usedUp = discount.maxUses !== null && discount.usedCount >= discount.maxUses;
              return (
                <tr key={discount.id} className={cn("border-t border-line", !discount.isActive && "opacity-50")}>
                  <td className="p-3">
                    <p className="font-mono font-semibold">{discount.code}</p>
                    <p className="text-xs text-muted">{describe(discount)}</p>
                  </td>
                  <td className="p-3 tabular-nums">
                    {discount.usedCount}
                    {discount.maxUses !== null && ` / ${discount.maxUses}`}
                  </td>
                  <td className="p-3">
                    <Price amount={discount.revenue} />
                    {discount.discounted > 0 && (
                      <p className="text-xs text-muted">{formatCurrency(discount.discounted)} given away</p>
                    )}
                  </td>
                  <td className="p-3 text-muted">{discount.expiresAt ? formatDate(discount.expiresAt) : "Never"}</td>
                  <td className="p-3">
                    {!discount.isActive ? (
                      <Badge>Off</Badge>
                    ) : expired ? (
                      <Badge tone="danger">Expired</Badge>
                    ) : usedUp ? (
                      <Badge tone="danger">Used up</Badge>
                    ) : (
                      <Badge tone="success">Live</Badge>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toggle(discount)}>
                      {discount.isActive ? "Turn off" : "Turn on"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {codes.length === 0 && <p className="p-8 text-center text-sm text-muted">No discount codes yet.</p>}
      </div>
    </div>
  );
}
