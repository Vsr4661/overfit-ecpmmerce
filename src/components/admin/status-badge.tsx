import { Badge } from "@/components/ui";
import type { OrderStatus } from "@/types";

const TONES: Record<OrderStatus, "neutral" | "accent" | "success" | "danger" | "ink"> = {
  PENDING: "neutral",
  PAID: "accent",
  PACKED: "ink",
  SHIPPED: "ink",
  DELIVERED: "success",
  CANCELLED: "danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONES[status]}>{status === "PENDING" ? "Unpaid" : status.toLowerCase()}</Badge>;
}
