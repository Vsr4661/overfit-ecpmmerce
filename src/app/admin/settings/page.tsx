"use client";

import { useState } from "react";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "Overfit",
    supportEmail: "support@overfit.com",
    currency: "INR",
    enableCod: false,
    lowStockThreshold: "10",
  });

  return (
    <div className="space-y-5">
      <AdminNav />
      <h1 className="text-2xl font-semibold">Admin / Settings</h1>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Store Settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input
            value={settings.storeName}
            onChange={(event) =>
              setSettings((current) => ({ ...current, storeName: event.target.value }))
            }
            className="rounded border border-zinc-300 p-2 text-sm"
            placeholder="Store name"
          />
          <input
            value={settings.supportEmail}
            onChange={(event) =>
              setSettings((current) => ({ ...current, supportEmail: event.target.value }))
            }
            className="rounded border border-zinc-300 p-2 text-sm"
            placeholder="Support email"
          />
          <input
            value={settings.currency}
            onChange={(event) =>
              setSettings((current) => ({ ...current, currency: event.target.value }))
            }
            className="rounded border border-zinc-300 p-2 text-sm"
            placeholder="Currency"
          />
          <input
            value={settings.lowStockThreshold}
            onChange={(event) =>
              setSettings((current) => ({ ...current, lowStockThreshold: event.target.value }))
            }
            className="rounded border border-zinc-300 p-2 text-sm"
            placeholder="Low stock threshold"
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.enableCod}
            onChange={(event) =>
              setSettings((current) => ({ ...current, enableCod: event.target.checked }))
            }
          />
          Enable cash on delivery
        </label>
        <button className="mt-5 rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
          Save Settings
        </button>
      </section>
    </div>
  );
}
