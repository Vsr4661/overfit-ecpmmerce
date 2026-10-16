import { AdminHeading } from "@/components/admin/admin-heading";
import { missingBusinessDetails } from "@/lib/business";
import { isEmailConfigured } from "@/lib/email";
import { Badge } from "@/components/ui";
import { isPrintroveAutoFulfilEnabled, isPrintroveConfigured } from "@/lib/printrove";
import { FLAT_SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/pricing";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { formatCurrency } from "@/lib/utils";

function Row({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-0.5 text-sm text-muted">{detail}</p>
      </div>
      <Badge tone={ok ? "success" : "neutral"}>{ok ? "On" : "Off"}</Badge>
    </div>
  );
}

export default function AdminSettingsPage() {
  const razorpay = isRazorpayConfigured();
  const webhook = Boolean(process.env.RAZORPAY_WEBHOOK_SECRET);
  const printrove = isPrintroveConfigured();
  const autoFulfil = isPrintroveAutoFulfilEnabled();

  return (
    <div className="max-w-3xl">
      <AdminHeading title="Settings" />
      <p className="mb-6 text-sm text-muted">
        Settings come from environment variables in <code>.env</code> (see <code>.env.example</code>). Restart the
        server after changing them.
      </p>

      <section className="divide-y divide-line bg-surface">
        <Row
          label="Razorpay payments"
          ok={razorpay}
          detail={razorpay ? "Taking real payments." : "Test mode: orders are marked paid without charging. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."}
        />
        <Row
          label="Razorpay webhook"
          ok={webhook}
          detail={`Backup payment confirmation. Point Razorpay to /api/webhooks/razorpay (events: payment.captured, order.paid) and set RAZORPAY_WEBHOOK_SECRET.`}
        />
        <Row
          label="Printrove catalog"
          ok={printrove}
          detail={printrove ? "Connected. Use Products → Sync to import your library." : "Set PRINTROVE_TOKEN to import products."}
        />
        <Row
          label="Auto-fulfil with Printrove"
          ok={autoFulfil}
          detail="When on, paid orders are sent to Printrove automatically. Set PRINTROVE_AUTO_FULFIL=true."
        />
        <Row
          label="Printrove status webhook"
          ok={Boolean(process.env.PRINTROVE_WEBHOOK_SECRET)}
          detail="Moves orders to Shipped / Delivered automatically. Point Printrove → Settings → Webhooks to /api/webhooks/printrove and set PRINTROVE_WEBHOOK_SECRET."
        />
        <Row
          label="Order emails"
          ok={isEmailConfigured()}
          detail={isEmailConfigured() ? `Sending from ${process.env.EMAIL_FROM}.` : "Confirmation and shipped emails are logged, not sent. Set RESEND_API_KEY and EMAIL_FROM."}
        />
        <Row
          label="WhatsApp button"
          ok={Boolean(process.env.WHATSAPP_NUMBER)}
          detail="Floating chat button on the storefront. Set WHATSAPP_NUMBER (with country code)."
        />
      </section>

      <section className="mt-8 bg-surface p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium">Business details for legal pages</p>
            <p className="mt-1 text-sm text-muted">
              Shown on Privacy, Terms, Refunds, Shipping and Contact. Razorpay checks these before activating live
              payments. Edit <code>src/lib/business.ts</code>.
            </p>
          </div>
          <Badge tone={missingBusinessDetails().length === 0 ? "success" : "danger"}>
            {missingBusinessDetails().length === 0 ? "Complete" : `${missingBusinessDetails().length} missing`}
          </Badge>
        </div>
        {missingBusinessDetails().length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-sm text-danger">
            {missingBusinessDetails().map((item) => (
              <li key={item.field}>{item.label}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 bg-surface p-4">
        <p className="font-medium">Shipping</p>
        <p className="mt-1 text-sm text-muted">
          {formatCurrency(FLAT_SHIPPING_FEE)} flat, free from {formatCurrency(FREE_SHIPPING_THRESHOLD)}. Change in{" "}
          <code>src/lib/pricing.ts</code>.
        </p>
      </section>
    </div>
  );
}
