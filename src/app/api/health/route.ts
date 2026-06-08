import { features } from "@/lib/env";
import { json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight liveness probe for uptime monitoring. Reports which
 *  integrations are wired up without leaking any secret values. */
export function GET() {
  return json({
    status: "ok",
    time: new Date().toISOString(),
    integrations: {
      database: features.database,
      payments: features.lemonSqueezy,
      webhooks: features.lemonSqueezyWebhook,
      email: features.resend,
      rateLimit: features.rateLimit,
    },
  });
}
