"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button, Price, Select } from "@/components/ui";
import { ORDER_STATUSES } from "@/lib/pricing";
import { cn, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types";

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  city: string;
  total: number;
  status: string;
  itemCount: number;
  createdAt: string;
  printroveOrderId: string | null;
  fulfilmentError: string | null;
  viewUrl: string;
};

function OrderRow({ order, printroveConfigured }: { order: AdminOrderRow; printroveConfigured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const status = order.status as OrderStatus;

  const call = async (url: string, init: RequestInit) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? data.fulfilmentError ?? "Request failed");
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const isPaid = status !== "PENDING" && status !== "CANCELLED";

  return (
    <tr className="border-t border-line align-top">
      <td className="p-3">
        <Link href={order.viewUrl} target="_blank" className="font-medium hover:underline">
          {order.orderNumber}
        </Link>
        <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
      </td>
      <td className="p-3">
        <p>{order.customerName}</p>
        <p className="text-xs text-muted">
          {order.customerEmail} · {order.city}
        </p>
      </td>
      <td className="p-3">
        <Price amount={order.total} className="font-medium" />
        <p className="text-xs text-muted">{order.itemCount} {order.itemCount === 1 ? "item" : "items"}</p>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <Select
            aria-label={`Change status of ${order.orderNumber}`}
            value={status}
            disabled={busy}
            onChange={(event) =>
              call(`/api/admin/orders/${order.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: event.target.value }),
              })
            }
            className="h-8 w-32 text-xs"
          >
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value} disabled={status === "PENDING" && value !== "PENDING" && value !== "CANCELLED"}>
                {value === "PENDING" ? "Unpaid" : value.charAt(0) + value.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </div>
        {error && <p className="mt-1 max-w-xs text-xs text-danger">{error}</p>}
      </td>
      <td className="p-3 text-xs">
        {order.printroveOrderId ? (
          <div className="space-y-1">
            <span className="text-success">Printrove #{order.printroveOrderId}</span>
            {order.fulfilmentError && <p className="max-w-[16rem] text-danger">{order.fulfilmentError}</p>}
          </div>
        ) : order.fulfilmentError ? (
          <div className="space-y-1">
            <p className="max-w-[16rem] text-danger">{order.fulfilmentError}</p>
            <Button
              size="sm"
              variant="secondary"
              disabled={busy || !printroveConfigured}
              onClick={() => call(`/api/admin/orders/${order.id}/fulfil`, { method: "POST" })}
            >
              Retry
            </Button>
          </div>
        ) : isPaid && printroveConfigured ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => call(`/api/admin/orders/${order.id}/fulfil`, { method: "POST" })}
          >
            Send to Printrove
          </Button>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
    </tr>
  );
}

const FILTERS = [
  { key: "open", label: "To fulfil", match: (s: string) => s === "PAID" || s === "PACKED" },
  { key: "all", label: "All", match: () => true },
  { key: "shipped", label: "Shipped", match: (s: string) => s === "SHIPPED" || s === "DELIVERED" },
  { key: "unpaid", label: "Unpaid", match: (s: string) => s === "PENDING" },
  { key: "cancelled", label: "Cancelled", match: (s: string) => s === "CANCELLED" },
];

export function OrderTable({ orders, printroveConfigured }: { orders: AdminOrderRow[]; printroveConfigured: boolean }) {
  const [filter, setFilter] = useState("all");
  const active = FILTERS.find((f) => f.key === filter) ?? FILTERS[1];
  const visible = useMemo(() => orders.filter((order) => active.match(order.status)), [orders, active]);

  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => {
          const count = orders.filter((order) => f.match(order.status)).length;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 border px-3 py-1.5 text-xs font-semibold",
                filter === f.key ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink",
              )}
            >
              {f.label} <span className="opacity-50">{count}</span>
            </button>
          );
        })}
      </div>
      <div className="overflow-x-auto bg-surface">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="label">
            <tr>
              <th className="p-3 font-semibold">Order</th>
              <th className="p-3 font-semibold">Customer</th>
              <th className="p-3 font-semibold">Total</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Fulfilment</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <OrderRow key={order.id} order={order} printroveConfigured={printroveConfigured} />
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="p-8 text-center text-sm text-muted">No orders here.</p>}
      </div>
    </>
  );
}
