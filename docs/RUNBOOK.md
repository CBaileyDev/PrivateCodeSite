# Incident Runbook

Quick triage for the most common production issues.

## A customer didn't receive their license email

1. `GET /api/health` → confirm `payments`, `webhooks`, `email`, `database` are
   `true`.
2. In the DB, look for the order: `select * from orders where email = '...'`.
   - **Order exists, license exists** → email delivery issue. Check Resend logs;
     re-send from the customer's `/dashboard` (the masked key is shown there;
     the plaintext was only in the original email — if lost, see below).
   - **No order** → the webhook didn't arrive/verify. Go to step 3.
3. In Lemon Squeezy → Webhooks, inspect recent deliveries for
   `/api/webhook/lemonsqueezy`.
   - **401 Invalid signature** → `LEMONSQUEEZY_WEBHOOK_SECRET` mismatch. Fix the
     env var and **redeliver** the event.
   - **5xx** → transient DB/email error; redeliver (processing is idempotent, so
     this is safe — no duplicate licenses).
4. Lost plaintext key: keys are stored hashed and cannot be recovered. Issue a
   replacement by re-running fulfillment for that order, or comp a new license.

## Webhooks failing / retrying

- 401 → signature secret mismatch (see above).
- 503 → `LEMONSQUEEZY_WEBHOOK_SECRET` unset, or `DATABASE_URL` unset.
- 500 → check logs for the `eventId`; the event is recorded in `webhook_events`
  with the error. Fix the cause; Lemon Squeezy will retry, or redeliver
  manually. Idempotency prevents duplicate fulfillment.

## Checkout button does nothing / errors

- 503 from `/api/checkout` → Lemon Squeezy not configured
  (`LEMONSQUEEZY_API_KEY` / `STORE_ID` / `VARIANT_ID`).
- 403 → CSRF/origin mismatch; confirm `NEXT_PUBLIC_APP_URL` matches the real
  origin.
- 429 → rate limited; expected under abuse, otherwise raise the limit in
  `src/app/api/checkout/route.ts`.

## Refund didn't deactivate a license

`order_refunded` sets the order to `refunded` and licenses to `refunded`
(validation then returns `valid: false`). If it didn't fire, redeliver the
`order_refunded` webhook, or run `refundOrder(provider, providerOrderId)`.

## Site is down

- Check Vercel deployment status and `/api/health`.
- Roll back to the previous deployment in Vercel if a release regressed.
- DB issues: verify Supabase status and that `DATABASE_URL` points at the
  **pooler** (port 6543) — the app sets `prepare:false` for pgbouncer.

## Rotating secrets

- `LICENSE_HASH_SECRET`: **do not rotate casually** — it invalidates all stored
  license hashes. If you must, plan a re-issue migration.
- Provider keys: rotate in the provider dashboard, update Vercel env, redeploy.
