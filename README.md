# PrivateCode — Marketing + Sales Site

Production-grade marketing and commerce site for
[PrivateCode](https://github.com/CBaileyDev/PrivateCode) — the native, instant,
local-first AI coding agent. Built to take real payments, deliver licenses, and
manage customers.

> **Migration note.** This repo previously contained a single placeholder
> `index.html` (a one-line stub pointing at an artifact that wasn't in the
> repo). It has been rebuilt as a full **Next.js (App Router) + TypeScript**
> application. The marketing copy is grounded in the product described in the
> PrivateCode README.

## Stack

| Concern    | Choice                                                 |
| ---------- | ------------------------------------------------------ |
| Framework  | **Next.js 16** (App Router, RSC, Server Actions) + TS  |
| Styling    | Tailwind CSS v4 + shadcn-style components              |
| Payments   | **Lemon Squeezy** hosted checkout + signed webhooks    |
| Database   | **Supabase** Postgres via **Drizzle ORM** (+ RLS)      |
| Auth       | **Supabase Auth** (magic-link) for the customer portal |
| Email      | **Resend** (license delivery, refunds, support)        |
| Rate limit | **Upstash** Redis (sliding window, graceful fallback)  |
| Analytics  | Vercel Analytics + Speed Insights                      |
| Forms      | React Hook Form + Zod                                  |
| Tests      | Vitest                                                 |
| Hosting    | Vercel                                                 |

> The spec called for "Next.js 15". `create-next-app@latest` now provisions
> **Next.js 16**, the current stable major (App Router, Server Actions, React
> 19). It is a strict superset of the requested capabilities, so this project
> targets 16.

## Designed to run without secrets

Every third-party integration is **optional and validated**. With no `.env`
configured the site still builds, type-checks, and renders — checkout, email,
DB, auth, and rate limiting degrade gracefully (see `src/lib/env.ts` and
`/api/health`). Wire up credentials to switch each capability on.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in what you need (all optional to boot)
npm run dev                  # http://localhost:3000
```

### Scripts

| Script                | What it does                             |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Dev server                               |
| `npm run build`       | Production build                         |
| `npm run start`       | Serve the production build               |
| `npm run lint`        | ESLint (next/core-web-vitals + TS)       |
| `npm run typecheck`   | `tsc --noEmit`                           |
| `npm test`            | Vitest (unit + webhook integration)      |
| `npm run format`      | Prettier write                           |
| `npm run db:generate` | Generate a Drizzle migration from schema |
| `npm run db:migrate`  | Apply migrations to `DATABASE_URL`       |
| `npm run db:studio`   | Drizzle Studio                           |

## Project structure

```
src/
  app/
    page.tsx                     Landing page (ISR, JSON-LD)
    layout.tsx                   Root layout, SEO, fonts, analytics, toaster
    loading|error|not-found.tsx  Boundaries
    sitemap|robots|manifest.ts   SEO / PWA
    checkout/success|cancel/     Post-payment pages
    dashboard/                   Customer license portal (auth-gated)
    login/                       Magic-link sign in
    support/                     Contact form + server action
    legal/{terms,privacy,refund} Compliance pages
    auth/callback/               Supabase code exchange
    api/
      checkout/                  Create Lemon Squeezy checkout (CSRF + rate-limited)
      webhook/lemonsqueezy/      Signed webhook → license + email
      license/validate/          Desktop-app license validation (CORS)
      orders/                    Customer order history (protected)
      health/                    Uptime probe
  components/
    ui/                          Button, Card, Input, Badge, Reveal, …
    marketing/                   Hero, Features, Pricing, Comparison, FAQ, …
    site/                        Header, Footer, Logo, PageShell
  lib/
    env.ts                       Validated env + capability flags
    license.ts                   Key generation + HMAC hashing (never plaintext)
    lemonsqueezy.ts              Checkout + webhook signature verification
    email.ts                     Resend templates
    rate-limit.ts                Upstash limiter (+ fallback)
    validations.ts               Zod schemas
    db/                          Drizzle schema, client, queries
    supabase/                    Server / browser / admin clients
drizzle/                         Generated SQL migrations
supabase/rls.sql                 Row Level Security policies
docs/                            SECURITY, DEPLOYMENT, RUNBOOK
```

## Configuring integrations

See [`.env.example`](./.env.example) for every variable. Summary:

### Payments (Lemon Squeezy)

1. Create a store, product, and **variant**; copy the variant id.
2. Create an API key → `LEMONSQUEEZY_API_KEY`; set `LEMONSQUEEZY_STORE_ID` and
   `LEMONSQUEEZY_VARIANT_ID`.
3. Add a webhook pointing at `https://<domain>/api/webhook/lemonsqueezy` for
   `order_created` and `order_refunded`; copy its signing secret to
   `LEMONSQUEEZY_WEBHOOK_SECRET`.

### Database (Supabase + Drizzle)

```bash
export DATABASE_URL="postgres://...pooler.supabase.com:6543/postgres"
npm run db:migrate                      # create tables
psql "$DATABASE_URL" -f supabase/rls.sql # apply Row Level Security
```

### Email (Resend) & Auth (Supabase)

Set `RESEND_API_KEY` + verified `EMAIL_FROM`. For the portal, set
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and (server-only)
`SUPABASE_SERVICE_ROLE_KEY`. **Always** generate a strong
`LICENSE_HASH_SECRET` (`openssl rand -hex 32`) — required in production.

## Purchase → fulfillment flow

```
Customer clicks "Get PrivateCode"
  → POST /api/checkout (CSRF check, rate limit) → Lemon Squeezy hosted checkout
  → customer pays (card data never touches us — PCI handled by Lemon Squeezy)
  → Lemon Squeezy POSTs order_created to /api/webhook/lemonsqueezy
      • verify HMAC signature (constant-time)
      • dedupe via webhook_events (idempotent)
      • generate license key, store ONLY its HMAC hash + a masked display form
      • email the plaintext key via Resend (shown exactly once)
  → customer lands on /checkout/success and can sign into /dashboard
Desktop app validates keys via GET /api/license/validate.
```

## Security highlights

Full details in [`docs/SECURITY.md`](./docs/SECURITY.md). In short: strict
security headers (CSP, HSTS, frame/sniff/referrer/permissions) set globally,
Zod validation on every endpoint, CSRF (same-origin) checks on state changes,
webhook signature verification, license keys stored hashed, RLS in Supabase,
rate limiting, and secrets only ever read from the environment.

## What's done vs. what needs your accounts

**Implemented & verified (builds, type-checks, tests, runs):** the full
marketing site, checkout API, signed webhook + idempotent fulfillment, license
generation/validation, email templates, customer portal, auth, support form,
legal pages, security headers, rate limiting, SEO, DB schema + migrations + RLS,
unit/integration tests, and CI.

**Needs external setup (no code changes required):** real Lemon Squeezy /
Supabase / Resend / Upstash credentials, running the DB migration + RLS, Vercel
project + custom domain, and optional Sentry. See
[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

**Intentionally left as follow-ups** (to avoid over-engineering a one-time
product): a full admin dashboard (refunds are already automated via webhook),
Storybook, PostHog/Plausible, and Playwright E2E — all noted in the deployment
doc.
