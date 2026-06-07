import { assertProductionSecrets, features, publicEnv } from "@/lib/env";
import { error, isSameOrigin, json, readJson } from "@/lib/http";
import { getClientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { createCheckout, LemonSqueezyError } from "@/lib/lemonsqueezy";
import { checkoutSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // CSRF: reject cross-origin state changes.
  if (!isSameOrigin(request)) return error("Invalid origin", 403);

  // Rate limit per IP.
  const ip = getClientIp(request);
  const rl = await rateLimit(ip, { name: "checkout", max: 10, window: "60 s" });
  if (!rl.success) {
    return error(
      "Too many requests. Please slow down.",
      429,
      rateLimitHeaders(rl),
    );
  }

  if (!features.lemonSqueezy) {
    return error(
      "Checkout is temporarily unavailable. Please try again later.",
      503,
    );
  }

  assertProductionSecrets();

  const body = (await readJson(request)) ?? {};
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid request", 422);
  }

  try {
    const { url } = await createCheckout({
      email: parsed.data.email,
      variantId: parsed.data.variantId,
      redirectUrl: `${publicEnv.NEXT_PUBLIC_APP_URL}/checkout/success`,
    });
    return json({ url }, { headers: rateLimitHeaders(rl) });
  } catch (err) {
    const status = err instanceof LemonSqueezyError ? (err.status ?? 502) : 500;
    logger.error("Checkout creation failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    // Never leak provider internals to the client.
    return error("Could not start checkout. Please try again.", status);
  }
}
