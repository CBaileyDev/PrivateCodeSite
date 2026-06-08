import { features } from "@/lib/env";
import { json } from "@/lib/http";
import { getClientIp, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { licenseValidateSchema } from "@/lib/validations";
import { hashLicenseKey } from "@/lib/license";
import { activateLicenseByHash } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// This endpoint is called by the native desktop app, so it is intentionally
// CORS-open for reads. It never returns the key or any PII.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(ip, { name: "license", max: 60, window: "60 s" });
  if (!rl.success) {
    return json(
      { valid: false, reason: "rate_limited" },
      { status: 429, headers: { ...CORS, ...rateLimitHeaders(rl) } },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = licenseValidateSchema.safeParse({
    key: searchParams.get("key") ?? "",
    instanceId: searchParams.get("instanceId") ?? undefined,
    instanceName: searchParams.get("instanceName") ?? undefined,
  });
  if (!parsed.success) {
    return json(
      { valid: false, reason: "invalid_request" },
      { status: 422, headers: CORS },
    );
  }

  if (!features.database) {
    return json(
      { valid: false, reason: "service_unavailable" },
      { status: 503, headers: CORS },
    );
  }

  const result = await activateLicenseByHash({
    keyHash: hashLicenseKey(parsed.data.key),
    instanceId: parsed.data.instanceId,
    instanceName: parsed.data.instanceName,
  });
  if (!result.valid) {
    return json({ valid: false, reason: result.reason }, { headers: CORS });
  }

  return json(
    {
      valid: true,
      status: result.license.status,
      expiresAt: result.license.expiresAt,
      activationLimit: result.license.activationLimit,
      activations: result.license.activations,
    },
    { headers: CORS },
  );
}
