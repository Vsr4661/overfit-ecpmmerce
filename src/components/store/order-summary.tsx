import { Price } from "@/components/ui";
import { FREE_SHIPPING_THRESHOLD, orderTotals } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";

export function OrderTotals({ subtotal, discount }: { subtotal: number; discount?: { code: string; amount: number } }) {
  const { discountAmount, shippingFee, total } = orderTotals(subtotal, discount?.amount ?? 0);
  const remaining = FREE_SHIPPING_THRESHOLD - (subtotal - discountAmount);

  return (
    <div className="space-y-4">
      {subtotal > 0 && remaining > 0 && (
        <div className="space-y-2">
          <p className="text-xs">
            Add <strong>{formatCurrency(remaining)}</strong> more for free shipping
          </p>
          <div className="h-1 bg-line" aria-hidden>
            <div className="h-full bg-accent" style={{ width: `${Math.min(100, ((subtotal - discountAmount) / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
          </div>
        </div>
      )}
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>
            <Price amount={subtotal} />
          </dd>
        </div>
        {discount && discountAmount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Discount ({discount.code})</dt>
            <dd className="tabular-nums">−{formatCurrency(discountAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd>{shippingFee === 0 ? "Free" : <Price amount={shippingFee} />}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>
            <Price amount={total} />
          </dd>
        </div>
      </dl>
      <p className="text-xs text-muted">Prices include GST.</p>
    </div>
  );
}
