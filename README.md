## Overfit Ecommerce

Production-ready Next.js App Router starter for a clothing ecommerce brand.

### Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Razorpay integration (server route)
- Admin dashboard placeholders

### Included Pages

- `/` Home / featured products
- `/products` Product listing
- `/products/[slug]` Product detail
- `/cart` Cart
- `/checkout` Checkout
- `/orders/[orderId]` Order tracking
- `/admin` Admin dashboard
- `/admin/products` Admin products table
- `/admin/orders` Admin orders table

### Getting Started

1. Install dependencies:
   - `npm install`
2. Copy env values:
   - `cp .env.example .env`
3. Set your PostgreSQL URL and Razorpay keys in `.env`.
4. Generate Prisma client:
   - `npm run prisma:generate`
5. Run dev server:
   - `npm run dev`

### Prisma Commands

- `npm run prisma:migrate`
- `npm run prisma:studio`

### API Endpoints

- `GET /api/products`
- `POST /api/orders` (placeholder order creation)
- `GET /api/orders/[orderId]`
- `POST /api/razorpay/order`

### Production Hardening Checklist

- Add authentication and role-based authorization for admin routes.
- Add webhook verification for Razorpay payment status.
- Replace mock fallback data with strict database-only reads in production.
- Add order, payment, and inventory transactional logic.
- Add automated tests (unit + integration + e2e).
