import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PAID", label: "Confirmed" },
  { status: "PACKED", label: "Printed & packed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return <p className="border border-danger bg-danger/5 p-4 text-sm text-danger">This order was cancelled.</p>;
  }
  if (status === "PENDING") {
    return (
      <p className="border border-line bg-surface p-4 text-sm">
        Waiting for payment confirmation. This usually takes under a minute. If you were charged, don&apos;t pay
        again; the order will update automatically.
      </p>
    );
  }

  const current = STEPS.findIndex((step) => step.status === status);
  return (
    <ol className="grid grid-cols-4">
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step.status} className="relative flex flex-col items-center gap-2 text-center">
            {index > 0 && (
              <span
                className={cn("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", index <= current ? "bg-ink" : "bg-line")}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center border-2",
                done ? "border-ink bg-ink text-white" : "border-line bg-paper text-muted",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{index + 1}</span>}
            </span>
            <span className={cn("text-[11px] font-semibold uppercase tracking-[0.06em]", done ? "text-ink" : "text-muted")}>
              {step.label}
            </span>
            <span className="sr-only">{done ? "complete" : "pending"}</span>
          </li>
        );
      })}
    </ol>
  );
}
