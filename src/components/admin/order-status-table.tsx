"use client";

import Link from "next/link";
import { useState } from "react";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";

const statuses = ["PENDING", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function OrderStatusTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-100 text-zinc-600">
          <tr>
            <th className="px-4 py-3">Order #</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-zinc-200">
              <td className="px-4 py-3">{order.orderNumber}</td>
              <td className="px-4 py-3">{order.customerName}</td>
              <td className="px-4 py-3">
                <select
                  value={order.status}
                  onChange={(event) =>
                    setOrders((current) =>
                      current.map((item) =>
                        item.id === order.id
                          ? { ...item, status: event.target.value as Order["status"] }
                          : item,
                      ),
                    )
                  }
                  className="rounded border border-zinc-300 px-2 py-1 text-xs"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">{formatCurrency(order.total)}</td>
              <td className="px-4 py-3">
                <Link href={`/orders/${order.id}`} className="text-blue-600 underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
