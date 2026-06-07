import { features } from "@/lib/env";
import { error, json } from "@/lib/http";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/supabase/server";
import { getOrdersForEmail } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Customer order history. Protected: requires an authenticated Supabase user,
 *  and only ever returns that user's own orders. */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(ip, { name: "orders", max: 30, window: "60 s" });
  if (!rl.success) return error("Too many requests", 429);

  if (!features.supabase) return error("Authentication is not configured", 503);
  if (!features.database) return error("Database is not configured", 503);

  const user = await getCurrentUser();
  if (!user?.email) return error("Unauthorized", 401);

  const rows = await getOrdersForEmail(user.email);

  // Shape the response: never expose key hashes or internal ids beyond order id.
  const orders = rows.map(({ order, license }) => ({
    id: order.id,
    status: order.status,
    amountCents: order.amountCents,
    currency: order.currency,
    receiptUrl: order.receiptUrl,
    createdAt: order.createdAt,
    license: license
      ? { displayKey: license.displayKey, status: license.status }
      : null,
  }));

  return json({ orders });
}
