# Overfit

Storefront for Overfit, an oversized-streetwear brand. Products are printed on demand by
[Printrove](https://printrove.com) and paid for with [Razorpay](https://razorpay.com).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + Postgres

## Getting started

```bash
npm install
cp .env.example .env          # then fill in AUTH_SECRET and ADMIN_PASSWORD (see below)
npm run db:up                 # starts Postgres in Docker on port 5433
npm run db:migrate            # creates the tables and seeds the admin user + sample products
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
| Customer sign-in (emailed code) and accounts | `src/lib/customers.ts`, `src/app/(store)/login`, `src/app/(store)/account` |
| Razorpay | `src/lib/razorpay.ts`, `src/app/api/checkout/*`, `src/app/api/webhooks/razorpay` |
| Discount codes | `evaluateDiscount` in `src/lib/pricing.ts`, Admin → Discounts |
| Order emails | `src/lib/email.ts` (Resend) |
| Printrove client and catalog sync | `src/lib/printrove.ts`, `src/lib/printrove-sync.ts` |
| Storefront pages | `src/app/(store)` |
| Admin | `src/app/admin`, `src/app/api/admin` |

**Checkout flow:** the cart lives in `localStorage`. `POST /api/checkout` re-prices every line from
the database (client prices are ignored), creates a `PENDING` order and a Razorpay order. After
payment, `POST /api/checkout/verify` checks Razorpay's signature and marks the order `PAID`,
decrementing stock exactly once. The Razorpay webhook does the same as a backup if the customer
closes the tab. Customers can view an order only through a signed link, or by entering the order
number and email at `/track`.

## Customer accounts

Customers sign in at `/login` with a 6-digit code emailed to them (no passwords). The first sign-in
creates their account and attaches every earlier guest order placed with that email. `/account`
holds their profile (name, phone, saved delivery address) and `/account/orders` lists their orders.
Checkout is pre-filled from the profile, and a signed-in customer's first order saves their address
(it only fills empty fields, so a gift order never overwrites a saved address). Guest checkout still works, and orders placed while signed in are linked
automatically. Codes expire after 10 minutes, allow 5 wrong guesses, and at most 5 can be requested
per email per hour. Without `RESEND_API_KEY` the code is printed in the server log. Admin accounts
can't use code sign-in; they keep the password login at `/admin/login`.

## Printrove

1. Set `PRINTROVE_TOKEN` in `.env`.
2. Import your Product Library: **Admin → Products → Sync from Printrove**, or `npm run sync:printrove`.
   New products are priced at cost × `PRINTROVE_MARKUP` (rounded up to …99). Re-syncing refreshes
   cost, images and sizes but keeps prices and visibility you've set in admin.
3. For automatic Shipped/Delivered updates, add a webhook in Printrove → Settings → Webhooks pointing
   to `https://<your-domain>/api/webhooks/printrove` (events: `order.shipped`, `order.delivered`,
   `order.cancelled`, `order.exception`) and set `PRINTROVE_WEBHOOK_SECRET`. Cancellations and
   delivery exceptions (RTO, lost) are flagged on the order in admin rather than auto-cancelled,
   since they need a refund or reship decision.
4. To send paid orders to Printrove automatically, set `PRINTROVE_AUTO_FULFIL=true`. Otherwise use
   **Send to Printrove** on each order in Admin → Orders. Failures are shown there with a retry button.

## Discount codes

Create codes in **Admin → Discounts**: percent (up to 90%) or fixed rupees off, with an optional
minimum order, usage limit and expiry date. Customers enter them at checkout. The server
re-validates the code when the order is placed, and a use is counted only once payment succeeds.
Free shipping is judged on the subtotal after the discount.

## Emails

Set `RESEND_API_KEY` and `EMAIL_FROM` (a sender on a domain verified in [Resend](https://resend.com))
to email customers when an order is paid and when it ships. Without them, emails are printed to
the server log instead, so nothing breaks locally.

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
| `npm test` | Unit tests (pricing, discounts, signatures, sessions) |
| `npm run db:migrate` | Apply schema changes (creates a migration) |
| `npm run db:seed` | Re-run the seed (admin user; sample products only if the catalog is empty) |
| `npm run db:studio` | Browse the database |
| `npm run sync:printrove` | Import the Printrove Product Library |

## Deploying to Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new). Framework: Next.js (detected).
2. In the project, open **Storage → Create Database → Neon (Postgres)** and connect it. This sets
   `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically.
3. Add the environment variables from `.env.example` (at minimum `AUTH_SECRET` and `ADMIN_PASSWORD`).
4. Deploy. Each build runs `prisma migrate deploy` and the seed (admin user, plus sample products if
   the catalog is empty and `SEED_SAMPLE_PRODUCTS` isn't `"false"`).
5. Set `NEXT_PUBLIC_SITE_URL` to your live URL and redeploy, so emails and the sitemap use it.

Checkout is disabled in production until Razorpay keys are set (test mode only runs locally).

## Before going live

- Fill in `src/lib/business.ts` (legal name, address, support contacts, grievance officer).
- Set `NODE_ENV=production`, real Razorpay keys and the webhook secret.
- Configure Resend so customers actually receive order emails.
- Set `WHATSAPP_NUMBER` to show the support chat button.
