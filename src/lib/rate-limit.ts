import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env, features } from "@/lib/env";
import { logger } from "@/lib/logger";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const limiters = new Map<string, Ratelimit>();
let warned = false;

function getLimiter(
  name: string,
  max: number,
  window: `${number} ${"s" | "m"}`,
) {
  const cached = limiters.get(name);
  if (cached) return cached;

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix: `ratelimit:${name}`,
    analytics: false,
  });
  limiters.set(name, limiter);
  return limiter;
}

/**
 * Sliding-window rate limit keyed by `identifier` (usually the client IP).
 * Degrades to "allow" when Upstash is not configured so local/dev still works —
 * a single warning is logged so this isn't silent in production.
 */
export async function rateLimit(
  identifier: string,
  {
    name = "default",
    max = 30,
    window = "60 s",
  }: { name?: string; max?: number; window?: `${number} ${"s" | "m"}` } = {},
): Promise<RateLimitResult> {
  if (!features.rateLimit) {
    if (!warned && env.NODE_ENV === "production") {
      warned = true;
      logger.warn(
        "Rate limiting is disabled: UPSTASH_REDIS_REST_URL/TOKEN are not set.",
      );
    }
    return { success: true, limit: max, remaining: max, reset: 0 };
  }

  const limiter = getLimiter(name, max, window);
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  return { success, limit, remaining, reset };
}

/** Best-effort client IP extraction from a Request's forwarding headers. */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

/** Standard rate-limit response headers. */
export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(r.limit),
    "X-RateLimit-Remaining": String(Math.max(0, r.remaining)),
    "X-RateLimit-Reset": String(r.reset),
  };
}
