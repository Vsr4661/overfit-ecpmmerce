"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input, Select } from "@/components/ui";
import { INDIAN_STATES } from "@/lib/india";

type Profile = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

export function ProfileForm({ email, initial }: { email: string; initial: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState<Profile>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const field = (name: keyof Profile) => ({
    id: name,
    name,
    value: form[name],
    "aria-invalid": Boolean(errors[name]),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((current) => ({ ...current, [name]: event.target.value }));
      setStatus(null);
    },
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      setErrors(data.fieldErrors ?? {});
      if (!response.ok) {
        setStatus({ ok: false, message: data.message ?? "Could not save. Try again." });
        return;
      }
      setStatus({ ok: true, message: "Saved. Checkout will use these details." });
      router.refresh();
    } catch {
      setStatus({ ok: false, message: "Network error. Try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-12">
      <section>
        <h2 className="label text-ink">Profile</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name" error={errors.name} className="sm:col-span-2">
            <Input {...field("name")} autoComplete="name" />
          </Field>
          <Field label="Email" htmlFor="email" hint="You sign in with this email, so it can't be changed here.">
            <Input id="email" value={email} disabled readOnly className="text-muted" />
          </Field>
          <Field label="Mobile number" htmlFor="phone" error={errors.phone}>
            <Input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="label text-ink">Delivery address</h2>
        <p className="mt-2 text-sm text-muted">Saved here, it&apos;s filled in for you at checkout.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Address" htmlFor="addressLine1" error={errors.addressLine1} className="sm:col-span-2">
            <Input {...field("addressLine1")} autoComplete="address-line1" placeholder="House no., street, area" />
          </Field>
          <Field label="Apartment, landmark (optional)" htmlFor="addressLine2" error={errors.addressLine2} className="sm:col-span-2">
            <Input {...field("addressLine2")} autoComplete="address-line2" />
          </Field>
          <Field label="City" htmlFor="city" error={errors.city}>
            <Input {...field("city")} autoComplete="address-level2" />
          </Field>
          <Field label="PIN code" htmlFor="postalCode" error={errors.postalCode}>
            <Input {...field("postalCode")} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
          </Field>
          <Field label="State" htmlFor="state" error={errors.state} className="sm:col-span-2">
            <Select {...field("state")} autoComplete="address-level1">
              <option value="">Choose state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {status && (
          <p className={status.ok ? "text-sm text-success" : "text-sm text-danger"} role="status">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
