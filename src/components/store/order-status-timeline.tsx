import { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const steps: OrderStatus[] = ["PENDING", "PAID", "PACKED", "SHIPPED", "DELIVERED"];

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const activeIndex = steps.indexOf(status);

  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => {
        const isActive = index <= activeIndex;
        return (
          <div
            key={step}
            className={cn(
              "rounded-lg border p-3 text-center text-xs font-medium",
              isActive
                ? "border-black bg-black text-white"
                : "border-zinc-200 bg-white text-zinc-600",
            )}
          >
            {step}
          </div>
        );
      })}
    </div>
  );
}
