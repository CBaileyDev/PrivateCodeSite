import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";

/** JSON response helper with no-store caching by default. */
export function json<T>(
  data: T,
  init?: { status?: number; headers?: Record<string, string> },
): NextResponse {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: { "Cache-Control": "no-store", ...init?.headers },
  });
}

/** Uniform error envelope. */
export function error(
  message: string,
  status = 400,
  headers?: Record<string, string>,
): NextResponse {
  return json({ error: message }, { status, headers });
}

/**
 * CSRF defense for state-changing requests: require the Origin (or Referer) to
 * match our own host. Browsers always send Origin on cross-site POSTs, so a
 * forged form from another site is rejected. Returns true when allowed.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin ?? referer;
  if (!source) {
    // Non-browser clients (curl, native apps) omit Origin. Allow only same-host
    // requests by comparing the Host header to our configured app host.
    const host = request.headers.get("host");
    try {
      return host === new URL(publicEnv.NEXT_PUBLIC_APP_URL).host;
    } catch {
      return false;
    }
  }
  try {
    const sourceHost = new URL(source).host;
    const selfHost = new URL(publicEnv.NEXT_PUBLIC_APP_URL).host;
    const requestHost = request.headers.get("host");
    return sourceHost === selfHost || sourceHost === requestHost;
  } catch {
    return false;
  }
}

/** Parse a JSON request body, returning null on malformed input. */
export async function readJson<T = unknown>(
  request: Request,
): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
