import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { env, features, publicEnv } from "@/lib/env";

/**
 * Request-scoped Supabase client backed by the user's cookies. Returns null
 * when Supabase isn't configured so callers can degrade gracefully.
 */
export async function createClient() {
  if (!features.supabase) return null;
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Invoked from a Server Component render — cookie writes are not
            // allowed there. Session refresh happens in middleware instead.
          }
        },
      },
    },
  );
}

/** Returns the authenticated user (or null). Uses getUser() which re-validates
 *  the JWT against Supabase rather than trusting the cookie. */
export async function getCurrentUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Service-role client that BYPASSES Row Level Security. Server-only, used for
 * privileged work (webhooks, admin). Never expose the service role key to the
 * browser.
 */
export function createAdminClient() {
  if (!features.supabaseAdmin) return null;
  return createServiceClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
