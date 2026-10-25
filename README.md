# DRIFT — Premium Gen-Z Streetwear Store

Production-oriented clothing e-commerce platform built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **MongoDB**, **Cloudinary**, **Auth.js**, and **Razorpay**.

Brand: **DRIFT** — minimal black/white streetwear storefront with a full admin CMS for products, media, homepage, orders, coupons, and inventory.

## Features

- Premium storefront: hero, categories, new arrivals, bestsellers, campaign, brand story, Instagram grid, newsletter, cart, wishlist, checkout
- Admin dashboard at `/admin` with RBAC (admin role only)
- Product CRUD with sizes, colors, tags, stock, draft/publish
- Cloudinary media library with upload, preview, reorder, primary image, alt text, and safe delete (ref-counted)
- Homepage CMS (announcement, hero, campaign, section visibility)
- Server-side pricing, coupons, stock reservation, Razorpay verification + webhook, optional COD
- SEO: metadata, Open Graph, product JSON-LD, sitemap, robots.txt

## Quick start

### 1. Install

```bash
cd clothing-brand
npm install --legacy-peer-deps
```

### 2. Environment

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required for local storefront + admin:

- `MONGODB_URI`
- `AUTH_SECRET` (generate with `openssl rand -base64 32`)
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (seed only)

Optional integrations:

- Cloudinary (`CLOUDINARY_*`) — required for admin image uploads
- Razorpay (`RAZORPAY_*`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`) — required for online payments
- `RAZORPAY_WEBHOOK_SECRET` — recommended for webhook verification
- `COD_ENABLED=true` — cash on delivery

Without Cloudinary/Razorpay credentials, the app still runs; uploads and online payments return clear configuration errors. COD works when enabled.

### 3. Seed sample data

Start MongoDB locally (or use Atlas), then:

```bash
npm run seed
```

This creates admin user, categories, products, homepage sections, settings, and coupon `DRIFT10`.

### 4. Develop

```bash
npm run dev
```

- Store: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/sdfg](http://localhost:3000/sdfg)

### 5. Test / build

```bash
npm test
npm run build   # uses webpack (`next build --webpack`) for Windows compatibility
npm start
```

## Vercel deployment

1. Push the `clothing-brand` app to GitHub.
2. Import the project in Vercel (root directory = `clothing-brand` if nested).
3. Add the same environment variables from `.env.example`.
4. Set `AUTH_URL` / `NEXT_PUBLIC_SITE_URL` to your production domain.
5. Use MongoDB Atlas + Cloudinary + Razorpay live/test keys.
6. Point Razorpay webhook to `https://your-domain.com/api/webhooks/razorpay`.
7. Deploy, then run seed once against the production MongoDB URI (locally with prod env, or a one-off script).

## Project structure

```
src/
  app/(store)/          # Storefront routes
  app/admin/            # Admin dashboard
  app/api/              # Auth, upload, webhooks, product helpers
  actions/              # Server actions (products, orders, CMS…)
  components/store/     # Storefront UI
  components/admin/     # Admin UI
  lib/                  # db, auth, cloudinary, pricing, queries
  models/               # Mongoose models
  store/                # Zustand cart / wishlist
scripts/seed.ts         # Optional development seed
```

## Security notes

- Admin routes protected by middleware + server-side `requireAdmin()` on mutations
- Passwords hashed with bcrypt
- Inputs validated with Zod
- Rate limiting on login-sensitive paths (upload, newsletter, checkout)
- Image uploads restricted by MIME type and 5MB size
- Payment amounts recalculated on the server; Razorpay signatures verified server-side
- Secrets only in environment variables — never commit `.env.local`

## Default seed coupon

- Code: `DRIFT10`
- 10% off, min order ₹999, max discount ₹500
