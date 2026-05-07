import { formatCurrency } from "@/lib/utils";

export function CartSummary({ subtotal }: { subtotal: number }) {
  const shipping = subtotal > 0 ? 99 : 0;
  const total = subtotal + shipping;

  return (
    <aside className="rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-semibold">Summary</h2>
      <div className="mt-4 space-y-2 text-sm text-zinc-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold text-zinc-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </aside>
  );
}
