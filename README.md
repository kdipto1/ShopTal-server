# ShopTal — Server

REST API for the ShopTal e-commerce platform. Built with Express, TypeScript, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js + Express 4 (TypeScript)
- **ORM/DB:** Prisma + PostgreSQL
- **Auth:** JWT access + refresh tokens, bcrypt password hashing
- **Payments:** Stripe (PaymentIntents + webhooks)
- **Storage:** Cloudinary (product images)
- **Security:** helmet, CORS allowlist, request validation (zod), rate limiting

## Features

- Authentication (signup, login, refresh token, password reset)
- Role-based access control (user / admin)
- Product catalog: products, categories, subcategories, brands
- Cart & checkout with server-side price computation
- Orders with transactional stock management and coupons
- Stripe payments finalized via webhook (order-first flow)
- Reviews, user profiles, admin analytics

## Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure environment** — copy `.env.example` values into `.env` (see table below).

3. **Set up the database:**

   ```bash
   pnpm exec prisma migrate dev
   ```

4. **Run in development:**

   ```bash
   pnpm dev
   ```

5. **Test Stripe webhooks locally** (requires the [Stripe CLI](https://stripe.com/docs/stripe-cli)):

   ```bash
   stripe listen --forward-to localhost:5000/api/v1/payment/webhook
   ```

   Copy the printed `whsec_...` signing secret into `STRIPE_WEBHOOK_SECRET`.

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (used by Prisma) |
| `DIRECT_URL` | Direct PostgreSQL connection string (migrations) |
| `PORT` | Server port (default `5000`) |
| `NODE_ENV` | `development` / `production` |
| `CLIENT_URL` | Comma-separated list of allowed CORS origins |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor (e.g. `12`) |
| `JWT_SECRET` | Access token secret |
| `JWT_EXPIRES_IN` | Access token lifetime (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (e.g. `30d`) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLOUDINARY_cloud_name` | Cloudinary cloud name |
| `CLOUDINARY_api_key` | Cloudinary API key |
| `CLOUDINARY_api_secret` | Cloudinary API secret |
| `SMTP_HOST` | SMTP host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_USER` | SMTP username (e.g. Gmail address) |
| `SMTP_PASS` | SMTP password (Gmail app password) |

## Scripts

- `pnpm dev` — start with nodemon
- `pnpm build` — compile TypeScript to `dist/`
- `pnpm start` — run compiled server
- `pnpm lint` — lint and auto-fix `src/`
- `pnpm format` — format with Prettier

## API Overview

All routes are mounted under `/api/v1`.

| Path | Description |
| --- | --- |
| `/auth` | signup, login, refresh token, password reset |
| `/users` | user management (admin) |
| `/products` | product CRUD + search/filter/pagination |
| `/categories`, `/subcategories`, `/brands` | catalog management |
| `/cart-items` | cart operations |
| `/orders` | order creation (order-first checkout), status updates, history |
| `/payment` | Stripe PaymentIntent creation + webhook |
| `/reviews` | product reviews |
| `/coupons` | coupon CRUD + apply |
| `/profile` | user profile |
| `/analytics` | admin dashboard analytics |

## ERD Diagram

![ShopTal ERD Diagram](https://i.ibb.co/km87qXW/Shop-Tal-Diagram-drawio.png)

## Author

Dipto Karmaker
