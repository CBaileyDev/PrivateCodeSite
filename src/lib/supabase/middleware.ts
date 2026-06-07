import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { features, publicEnv } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on each request and propagates updated
 * cookies. No-op when Supabase isn't configured. Must not import the database
 * or any Node-only modules — this runs in the middleware (edge) runtime.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  if (!features.supabase) return response;

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL!,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the session so expired tokens get refreshed into the response cookies.
  await supabase.auth.getUser();
  return response;
}
