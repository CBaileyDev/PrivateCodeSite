# Deployment

Target host: **Vercel**. The app is a standard Next.js project — no custom
build settings required.

## 1. Provision services

| Service       | You need                                              |
| ------------- | ----------------------------------------------------- |
| Supabase      | Pooled Postgres `DATABASE_URL`                        |
| Lemon Squeezy | API key, store id, variant id, webhook signing secret |
| Resend        | API key + verified sending domain (`EMAIL_FROM`)      |
| Upstash       | Redis REST URL + token                                |
| Vercel        | Project linked to this repo                           |

## 2. Database

```bash
export DATABASE_URL="postgres://...pooler.supabase.com:6543/postgres"
npm run db:migrate
psql "$DATABASE_URL" -f supabase/rls.sql
```

## 3. Environment variables (per environment)

Add everything from [`.env.example`](../.env.example) in the Vercel dashboard
for **Production**, **Preview**, and **Development**. Critical:

- `APP_URL` / `NEXT_PUBLIC_APP_URL` → your real origin.
- `LICENSE_HASH_SECRET` → `openssl rand -hex 32` (production refuses the dev
  fallback). **Keep this stable** — changing it invalidates all stored license
  hashes.
- Never expose `DATABASE_URL` / `LEMONSQUEEZY_API_KEY` to the client.

## 4. Lemon Squeezy webhook

Point a webhook at `https://<domain>/api/webhook/lemonsqueezy` for
`order_created` and `order_refunded`; set its secret as
`LEMONSQUEEZY_WEBHOOK_SECRET`. Use Lemon Squeezy **test mode** first and confirm
a license email arrives and a row lands in `orders` + `licenses`.

## 5. Deploy

Push to a branch → Vercel creates a **preview** deployment (great for PRs).
Merge to `main` → production. Add your custom domain in Vercel (SSL is
automatic).

## 6. Post-deploy checks

- `GET /api/health` with `Authorization: Bearer $ADMIN_API_KEY` shows all
  integrations `true` (unauthenticated requests get a bare `status: ok`).
- Test-mode purchase delivers a license email and populates the DB.
- `POST /api/license/validate` with `{"key": "...", "instanceId": "test-machine"}`
  returns `{ valid: true }` for that key (GET with query params also works for
  older app builds).
- Security headers present (`curl -I https://<domain>`).
- `robots.txt` / `sitemap.xml` resolve.

## CI / branch protection

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs format, lint,
typecheck, tests, build, and `npm audit` on every PR. Recommended branch
protection on `main`: require the **CI** check + ≥1 review, and require branches
to be up to date.

## Recommended follow-ups (not yet wired)

- **Sentry** for error + performance monitoring (`@sentry/nextjs`).
- **Uptime** monitor (UptimeRobot / Better Stack) hitting `/api/health`.
- **Product analytics** (PostHog/Plausible) if you want funnels beyond Vercel
  Analytics.
- **Playwright** E2E for the purchase flow; **Storybook** for components.
