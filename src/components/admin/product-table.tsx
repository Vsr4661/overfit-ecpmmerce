"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { AdminHeading } from "@/components/admin/admin-heading";
import { Badge, Button, Input, Price, ProductImage } from "@/components/ui";
import { cn, formatCurrency } from "@/lib/utils";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  category: string;
  price: number;
  costPrice: number | null;
  inventory: number;
  isActive: boolean;
  source: "Printrove" | "Manual";
};

async function patchProduct(id: string, data: Partial<Pick<AdminProduct, "price" | "inventory" | "isActive">>) {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error((await response.json()).message ?? "Update failed");
}

function ProductRow({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(product.price));
  const [inventory, setInventory] = useState(String(product.inventory));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const run = async (data: Parameters<typeof patchProduct>[1]) => {
    setSaving(true);
    setError("");
    try {
      await patchProduct(product.id, data);
      setEditing(false);
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const margin = product.costPrice ? product.price - product.costPrice : null;

  return (
    <tr className={cn("border-t border-line align-middle", !product.isActive && "opacity-50")}>
      <td className="p-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-paper">
            <ProductImage src={product.imageUrl} alt="" sizes="40px" />
          </div>
          <div className="min-w-0">
            <Link href={`/shop/${product.slug}`} className="block truncate font-medium hover:underline" target="_blank">
              {product.name}
            </Link>
            <p className="text-xs text-muted">
              {product.category} · {product.source}
            </p>
          </div>
        </div>
      </td>
      <td className="p-3">
        {editing ? (
          <Input aria-label="Price" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} className="h-9 w-24" />
        ) : (
          <div>
            <Price amount={product.price} className="font-medium" />
            {margin !== null && (
              <p className={cn("text-xs", margin > 0 ? "text-success" : "text-danger")}>
                cost {formatCurrency(product.costPrice!)} · margin {formatCurrency(Math.round(margin))}
              </p>
            )}
          </div>
        )}
      </td>
      <td className="p-3">
        {editing ? (
          <Input aria-label="Stock" type="number" min={0} value={inventory} onChange={(e) => setInventory(e.target.value)} className="h-9 w-24" />
        ) : (
          <span className={cn("tabular-nums", product.inventory <= 5 && "font-semibold text-danger")}>{product.inventory}</span>
        )}
      </td>
      <td className="p-3">
        {product.isActive ? <Badge tone="success">Live</Badge> : <Badge>Hidden</Badge>}
      </td>
      <td className="p-3 text-right">
        <div className="flex justify-end gap-2">
          {editing ? (
            <>
              <Button
                size="sm"
                disabled={saving}
                onClick={() => run({ price: Number(price), inventory: Math.floor(Number(inventory)) })}
              >
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" disabled={saving} onClick={() => run({ isActive: !product.isActive })}>
                {product.isActive ? "Hide" : "Publish"}
              </Button>
            </>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </td>
    </tr>
  );
}

export function ProductTable({ products, printroveConfigured }: { products: AdminProduct[]; printroveConfigured: boolean }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const sync = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const response = await fetch("/api/admin/printrove/sync", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSyncMessage(
        `Synced: ${data.created} new, ${data.updated} updated${data.skipped.length ? `, ${data.skipped.length} skipped (${data.skipped.join("; ")})` : ""}.`,
      );
      router.refresh();
    } catch (caught) {
      setSyncMessage(`Sync failed: ${(caught as Error).message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <AdminHeading title="Products">
        <Button
          onClick={sync}
          disabled={!printroveConfigured || syncing}
          title={printroveConfigured ? undefined : "Add PRINTROVE_TOKEN to .env to enable"}
        >
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          {syncing ? "Syncing…" : "Sync from Printrove"}
        </Button>
      </AdminHeading>
      {!printroveConfigured && (
        <p className="mb-4 text-sm text-muted">
          Printrove isn&apos;t connected. Add <code>PRINTROVE_TOKEN</code> to <code>.env</code> and restart to import your
          Product Library.
        </p>
      )}
      {syncMessage && <p className="mb-4 border border-line bg-surface p-3 text-sm" role="status">{syncMessage}</p>}

      <div className="overflow-x-auto bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="label">
            <tr>
              <th className="p-3 font-semibold">Product</th>
              <th className="p-3 font-semibold">Price</th>
              <th className="p-3 font-semibold">Stock</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-sm text-muted">No products yet.</p>}
      </div>
    </div>
  );
}
