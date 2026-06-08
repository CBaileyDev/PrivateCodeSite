import { z } from "zod";

/**
 * Centralised, validated environment access.
 *
 * Design goals:
 *  - Secrets are NEVER hardcoded — they are read from the environment only.
 *  - The marketing site must build and render without any third-party
 *    credentials configured, so every integration secret is optional and
 *    the app degrades gracefully (see the `has*` capability flags).
 *  - Anything that *is* present is validated, so a misconfigured value
 *    fails loudly instead of silently breaking a payment flow.
 */

const stringMin = (min = 1) => z.string().trim().min(min);

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Canonical, externally reachable origin (no trailing slash).
  APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000")
    .transform((v) => v.replace(/\/$/, "")),

  // Database (Supabase Postgres connection string).
  DATABASE_URL: stringMin().optional(),

  // Lemon Squeezy payments.
  LEMONSQUEEZY_API_KEY: stringMin().optional(),
  LEMONSQUEEZY_STORE_ID: stringMin().optional(),
  LEMONSQUEEZY_VARIANT_ID: stringMin().optional(),
  LEMONSQUEEZY_WEBHOOK_SECRET: stringMin().optional(),

  // Resend transactional email.
  RESEND_API_KEY: stringMin().optional(),
  EMAIL_FROM: z.string().default("PrivateCode <noreply@privatecode.dev>"),
  SUPPORT_EMAIL: z.string().email().default("support@privatecode.dev"),

  // Upstash Redis (rate limiting).
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: stringMin().optional(),

  // Secret pepper mixed into license-key hashing. A build-time fallback is
  // used in non-production so local builds work; production refuses the
  // fallback (see `assertProductionSecrets`).
  LICENSE_HASH_SECRET: stringMin().default("dev-only-insecure-pepper"),

  // Optional shared secret protecting the admin surface.
  ADMIN_API_KEY: stringMin().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000")
    .transform((v) => v.replace(/\/$/, "")),
});

function format(error: z.ZodError): string {
  return error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
}

function cleanEnv(raw: NodeJS.ProcessEnv) {
  // Treat blank strings (from .env files with FOO=) as absent so that
  // "cp .env.example .env.local" + leaving optionals empty just works,
  // matching the documented "runs without secrets" behavior.
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v != null) {
      const t = String(v).trim();
      out[k] = t === "" ? undefined : t;
    }
  }
  return out;
}

function parseServer() {
  const cleaned = cleanEnv(process.env);
  const parsed = serverSchema.safeParse(cleaned);
  if (!parsed.success) {
    // Invalid (not just missing) values are a hard failure.
    throw new Error(
      `Invalid server environment variables:\n${format(parsed.error)}`,
    );
  }
  return parsed.data;
}

function parseClient() {
  // Client vars must be referenced statically for Next.js inlining.
  const cleaned = cleanEnv(process.env);
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: cleaned.NEXT_PUBLIC_APP_URL,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid public environment variables:\n${format(parsed.error)}`,
    );
  }
  return parsed.data;
}

export const env = parseServer();
export const publicEnv = parseClient();

/** Capability flags — used to branch on whether an integration is wired up. */
export const features = {
  database: Boolean(env.DATABASE_URL),
  lemonSqueezy: Boolean(
    env.LEMONSQUEEZY_API_KEY &&
    env.LEMONSQUEEZY_STORE_ID &&
    env.LEMONSQUEEZY_VARIANT_ID,
  ),
  lemonSqueezyWebhook: Boolean(env.LEMONSQUEEZY_WEBHOOK_SECRET),
  resend: Boolean(env.RESEND_API_KEY),
  rateLimit: Boolean(
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
  ),
} as const;

/**
 * Fail fast in production if dangerous development fallbacks are still in
 * place. Call this from places that must not run with insecure defaults.
 */
export function assertProductionSecrets(): void {
  if (env.NODE_ENV !== "production") return;
  const problems: string[] = [];
  if (env.LICENSE_HASH_SECRET === "dev-only-insecure-pepper") {
    problems.push("LICENSE_HASH_SECRET must be set to a strong random value");
  }
  if (problems.length > 0) {
    throw new Error(
      `Refusing to run in production with insecure configuration:\n  - ${problems.join("\n  - ")}`,
    );
  }
}
