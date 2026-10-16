import "server-only";
import { orderAccessToken } from "@/lib/auth";
import { POLICY } from "@/lib/business";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001").replace(/\/$/, "");

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/** Sends via Resend's HTTP API. Without RESEND_API_KEY the email is logged instead, so flows still work locally. */
async function sendEmail(message: { to: string; subject: string; html: string; text: string }) {
  if (!isEmailConfigured()) {
    console.info(`[email:not-sent] to=${message.to} subject="${message.subject}"\n${message.text}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, ...message }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Resend responded ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function layout(heading: string, body: string, ctaUrl?: string, ctaLabel?: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f2ee;font-family:Helvetica,Arial,sans-serif;color:#111">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff">
<tr><td style="background:#111;color:#fff;padding:20px 28px;font-size:20px;font-weight:800;letter-spacing:1px">OVERFIT</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px">${heading}</h1>
${body}
${
    ctaUrl
      ? `<p style="margin:28px 0 0"><a href="${ctaUrl}" style="background:#ff4d1a;color:#fff;text-decoration:none;padding:12px 20px;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase">${ctaLabel}</a></p>`
      : ""
  }
</td></tr></table></td></tr></table></body></html>`;
}

async function loadOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return null;
  const trackingUrl = `${siteUrl()}/orders/${order.id}?t=${await orderAccessToken(order.id)}`;
  return { order, trackingUrl };
}

export async function sendOrderConfirmation(orderId: string) {
  const loaded = await loadOrder(orderId);
  if (!loaded) return;
  const { order, trackingUrl } = loaded;
  const firstName = escapeHtml(order.customerName.split(" ")[0]);

  const rows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px">${escapeHtml(item.productName)}${
          item.size ? ` · ${escapeHtml(item.size)}` : ""
        } × ${item.quantity}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px">${formatCurrency(
          item.unitPrice * item.quantity,
        )}</td></tr>`,
    )
    .join("");
  const totals = [
    ["Subtotal", formatCurrency(order.subtotal)],
    ...(order.discountAmount > 0 ? [[`Discount (${escapeHtml(order.discountCode ?? "")})`, `−${formatCurrency(order.discountAmount)}`]] : []),
    ["Shipping", order.shippingFee === 0 ? "Free" : formatCurrency(order.shippingFee)],
    ["<strong>Total paid</strong>", `<strong>${formatCurrency(order.total)}</strong>`],
  ]
    .map(([label, value]) => `<tr><td style="padding:4px 0;font-size:14px">${label}</td><td align="right" style="padding:4px 0;font-size:14px">${value}</td></tr>`)
    .join("");

  const html = layout(
    `Thanks, ${firstName}. Your order is confirmed.`,
    `<p style="margin:0 0 20px;font-size:14px;color:#555">Order <strong>${order.orderNumber}</strong>. We'll print it and email you when it ships, usually within ${POLICY.dispatchDays} business days.</p>
<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${totals}</table>
<p style="margin:20px 0 0;font-size:13px;color:#555">Shipping to: ${escapeHtml(
      [order.addressLine1, order.addressLine2, `${order.city}, ${order.state} ${order.postalCode}`].filter(Boolean).join(", "),
    )}</p>`,
    trackingUrl,
    "View your order",
  );
  const text = `Order ${order.orderNumber} confirmed. Total ${formatCurrency(order.total)}. Track it: ${trackingUrl}`;
  await sendEmail({ to: order.customerEmail, subject: `Order confirmed · ${order.orderNumber}`, html, text });
}

export async function sendOrderShipped(orderId: string) {
  const loaded = await loadOrder(orderId);
  if (!loaded) return;
  const { order, trackingUrl } = loaded;
  const html = layout(
    "Your order is on its way",
    `<p style="margin:0;font-size:14px;color:#555">Order <strong>${order.orderNumber}</strong> has shipped and should reach you in a few days. Track its progress from your order page.</p>`,
    trackingUrl,
    "Track order",
  );
  const text = `Order ${order.orderNumber} has shipped. Track it: ${trackingUrl}`;
  await sendEmail({ to: order.customerEmail, subject: `Shipped · ${order.orderNumber}`, html, text });
}

export async function sendLoginCode(email: string, code: string) {
  const html = layout(
    "Your sign-in code",
    `<p style="margin:0 0 20px;font-size:14px;color:#555">Enter this code on the Overfit sign-in page. It works for 10 minutes.</p>
<p style="margin:0;font-size:32px;font-weight:800;letter-spacing:8px">${code}</p>
<p style="margin:20px 0 0;font-size:13px;color:#555">If you didn't ask for this, you can ignore this email.</p>`,
  );
  const text = `Your Overfit sign-in code is ${code}. It works for 10 minutes. If you didn't ask for this, ignore this email.`;
  await sendEmail({ to: email, subject: `${code} is your Overfit sign-in code`, html, text });
}

/** Fire-and-forget wrapper: email problems must never break checkout or webhooks. */
export function notify(task: () => Promise<void>, label: string) {
  task().catch((error) => console.error(`[email] ${label} failed:`, (error as Error).message));
}
