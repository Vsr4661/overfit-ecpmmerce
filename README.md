# Overfit

Storefront for Overfit, an oversized-streetwear brand. Products are printed on demand by
[Printrove](https://printrove.com) and paid for with [Razorpay](https://razorpay.com).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite

## Getting started

```bash
npm install
cp .env.example .env          # then fill in AUTH_SECRET and ADMIN_PASSWORD (see below)
npm run db:migrate            # creates prisma/dev.db and seeds the admin user + sample products
npm run dev                   # http://localhost:3001
```

Generate a secret with `openssl rand -base64 32`. `ADMIN_PASSWORD` must be at least 10 characters.
Sign in to the admin panel at `/admin` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Without Razorpay keys the store runs in **test mode**: checkout marks orders as paid without
charging, so you can try the whole flow locally. Test mode is disabled in production.

## How it fits together

| Area | Where |
| --- | --- |
| Catalog (DB → pages) | `src/lib/catalog.ts` |
| Orders, payment capture, stock | `src/lib/orders.ts` |
| Shipping rule and order statuses | `src/lib/pricing.ts` |
| Sessions and signed order links | `src/lib/auth.ts`, `middleware.ts` |
| Razorpay | `src/lib/razorpay.ts`, `src/app/api/checkout/*`, `src/app/api/webhooks/razorpay` |
| Printrove client and catalog sync | `src/lib/printrove.ts`, `src/lib/printrove-sync.ts` |
| Storefront pages | `src/app/(store)` |
| Admin | `src/app/admin`, `src/app/api/admin` |

**Checkout flow:** the cart lives in `localStorage`. `POST /api/checkout` re-prices every line from
the database (client prices are ignored), creates a `PENDING` order and a Razorpay order. After
payment, `POST /api/checkout/verify` checks Razorpay's signature and marks the order `PAID`,
decrementing stock exactly once. The Razorpay webhook does the same as a backup if the customer
closes the tab. Customers can view an order only through a signed link, or by entering the order
number and email at `/track`.

## Printrove

1. Set `PRINTROVE_TOKEN` in `.env`.
2. Import your Product Library: **Admin → Products → Sync from Printrove**, or `npm run sync:printrove`.
   New products are priced at cost × `PRINTROVE_MARKUP` (rounded up to …99). Re-syncing refreshes
   cost, images and sizes but keeps prices and visibility you've set in admin.
3. To send paid orders to Printrove automatically, set `PRINTROVE_AUTO_FULFIL=true`. Otherwise use
   **Send to Printrove** on each order in Admin → Orders. Failures are shown there with a retry button.

## Razorpay

1. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (test keys locally).
2. In the Razorpay dashboard, add a webhook to `https://<your-domain>/api/webhooks/razorpay` for the
   `payment.captured` and `order.paid` events, and put its secret in `RAZORPAY_WEBHOOK_SECRET`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3001 |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Apply schema changes (creates a migration) |
| `npm run db:seed` | Re-run the seed (admin user; sample products only if the catalog is empty) |
| `npm run db:studio` | Browse the database |
| `npm run sync:printrove` | Import the Printrove Product Library |

## Before going live

- Move from SQLite to Postgres (change `provider` in `prisma/schema.prisma`) if you deploy to a
  serverless host. SQLite needs a persistent disk.
- Set `NODE_ENV=production`, real Razorpay keys and the webhook secret.
- Send order-confirmation emails (not implemented yet). Customers currently get a link on screen only.
