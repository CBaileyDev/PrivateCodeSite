# Security

How the spec's "non-negotiable" security requirements are implemented.

## Transport & headers

Set globally in [`next.config.ts`](../next.config.ts) for every route:

- **Content-Security-Policy** — `default-src 'self'`, `object-src 'none'`,
  `frame-ancestors 'none'`, `base-uri 'self'`, scoped `connect-src`/`frame-src`
  for Supabase / Lemon Squeezy / Upstash / Vercel, and `upgrade-insecure-requests`.
- **Strict-Transport-Security** — 2 years, `includeSubDomains; preload`.
- **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**,
  **Referrer-Policy: strict-origin-when-cross-origin**,
  **Permissions-Policy** (camera/mic/geo/topics denied),
  **Cross-Origin-Opener-Policy: same-origin**.

HTTPS is enforced by the host (Vercel) and `upgrade-insecure-requests`.

> The CSP is static so marketing pages stay statically rendered / ISR-friendly,
> which requires `'unsafe-inline'` on script/style for React's streaming
> payloads. For a strict **nonce-based** CSP, move the policy into the proxy
> (`src/proxy.ts`) and emit a per-request nonce — at the cost of static
> rendering. The current trade-off favors Core Web Vitals.

## Input validation & sanitization

Every API route and server action validates with **Zod**
(`src/lib/validations.ts`) with explicit length bounds. Responses never echo
raw provider errors. JSON-LD is built from trusted constants only.

## CSRF

State-changing endpoints (`/api/checkout`) require a same-origin
`Origin`/`Referer` (`isSameOrigin` in `src/lib/http.ts`). Webhooks are exempt
(they're cross-origin by design) and are instead protected by signature
verification.

## Webhook integrity

`/api/webhook/lemonsqueezy` reads the **raw** body and verifies the
`X-Signature` HMAC-SHA256 in **constant time** (`verifyWebhookSignature`)
before doing anything. Events are recorded in `webhook_events` and de-duplicated
for **idempotency**; processing failures return 5xx so the provider retries.

## License keys

Generated with a CSPRNG (`node:crypto`), Crockford base32, prefix `PVTC-`. We
store **only** a peppered HMAC-SHA256 hash (`LICENSE_HASH_SECRET`) plus a masked
display string — never the plaintext. Validation and verification are
constant-time. The plaintext is shown exactly once (purchase email).

## Database / RLS

Row Level Security is enabled on all tables (`supabase/rls.sql`),
default-deny, with read-only policies scoped to the signed-in user's email.
`webhook_events` is readable only by the service role. All writes go through
trusted server code using the service role / pooled connection.

## Rate limiting

Upstash sliding-window limits on `/api/checkout`, `/api/license/validate`,
`/api/orders`, and the contact action (`src/lib/rate-limit.ts`). Without
Upstash it fails open in dev and logs a single warning in production — put a
WAF/edge limit (Vercel/Cloudflare) in front for defense in depth.

## Secrets

Read exclusively from the environment and validated at boot. `.env*` is
gitignored. `assertProductionSecrets()` refuses to run in production with the
insecure dev `LICENSE_HASH_SECRET` fallback. Dependabot + `npm audit` (CI) keep
dependencies patched.

## Reporting

Email the address in `SUPPORT_EMAIL` (default `security@`/`support@`) with
details. Please do not open public issues for vulnerabilities.
