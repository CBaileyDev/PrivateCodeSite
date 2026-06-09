import { createHash, timingSafeEqual } from "node:crypto";
import { env, features } from "@/lib/env";
import { json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Constant-time string comparison (hash first so lengths never short-circuit). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function isAdmin(request: Request): boolean {
  if (!env.ADMIN_API_KEY) return false;
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return safeEqual(auth.slice("Bearer ".length).trim(), env.ADMIN_API_KEY);
}

/**
 * Lightweight liveness probe for uptime monitoring. The public response is a
 * bare "ok" — which integrations are (un)configured is operational detail an
 * attacker could use (e.g. "rate limiting is off"), so it is only included
 * when the request authenticates with ADMIN_API_KEY.
 */
export function GET(request: Request) {
  const body: Record<string, unknown> = {
    status: "ok",
    time: new Date().toISOString(),
  };

  if (isAdmin(request)) {
    body.integrations = {
      database: features.database,
      payments: features.lemonSqueezy,
      webhooks: features.lemonSqueezyWebhook,
      email: features.resend,
      rateLimit: features.rateLimit,
    };
  }

  return json(body);
}
