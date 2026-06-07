import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  licenses,
  orders,
  users,
  webhookEvents,
  type License,
  type Order,
} from "@/lib/db/schema";

/** Find or create a customer by (case-insensitive) email. */
async function upsertUserByEmail(
  tx: Awaited<ReturnType<typeof getDb>>,
  email: string,
) {
  const existing = await tx
    .select()
    .from(users)
    .where(eq(sql`lower(${users.email})`, email.toLowerCase()))
    .limit(1);
  if (existing[0]) return existing[0];

  const inserted = await tx.insert(users).values({ email }).returning();
  return inserted[0]!;
}

export type FulfilledOrder = { order: Order; license: License; isNew: boolean };

/**
 * Idempotently record a paid order and issue its license, in a single
 * transaction. If the provider order already exists, returns the existing
 * record (and its license) without creating duplicates.
 */
export async function recordOrderWithLicense(input: {
  email: string;
  provider: string;
  providerOrderId: string;
  variantId?: string | null;
  amountCents: number;
  currency: string;
  receiptUrl?: string | null;
  license: { keyHash: string; displayKey: string; expiresAt?: Date | null };
}): Promise<FulfilledOrder> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const user = await upsertUserByEmail(tx, input.email);

    const existing = await tx
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.provider, input.provider),
          eq(orders.providerOrderId, input.providerOrderId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      const lic = await tx
        .select()
        .from(licenses)
        .where(eq(licenses.orderId, existing[0].id))
        .limit(1);
      return { order: existing[0], license: lic[0]!, isNew: false };
    }

    const order = (
      await tx
        .insert(orders)
        .values({
          userId: user.id,
          provider: input.provider,
          providerOrderId: input.providerOrderId,
          variantId: input.variantId ?? null,
          email: input.email,
          status: "paid",
          amountCents: input.amountCents,
          currency: input.currency,
          receiptUrl: input.receiptUrl ?? null,
        })
        .returning()
    )[0]!;

    const license = (
      await tx
        .insert(licenses)
        .values({
          orderId: order.id,
          userId: user.id,
          keyHash: input.license.keyHash,
          displayKey: input.license.displayKey,
          status: "active",
          expiresAt: input.license.expiresAt ?? null,
        })
        .returning()
    )[0]!;

    return { order, license, isNew: true };
  });
}

/** Mark an order refunded and revoke its licenses. Idempotent. */
export async function refundOrder(
  provider: string,
  providerOrderId: string,
  partial = false,
): Promise<boolean> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const found = await tx
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.provider, provider),
          eq(orders.providerOrderId, providerOrderId),
        ),
      )
      .limit(1);
    if (!found[0]) return false;

    await tx
      .update(orders)
      .set({
        status: partial ? "partial_refund" : "refunded",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, found[0].id));

    if (!partial) {
      await tx
        .update(licenses)
        .set({ status: "refunded", updatedAt: new Date() })
        .where(eq(licenses.orderId, found[0].id));
    }
    return true;
  });
}

/** Orders + licenses for a customer's portal, newest first. */
export async function getOrdersForEmail(email: string) {
  const db = getDb();
  return db
    .select({
      order: orders,
      license: licenses,
    })
    .from(orders)
    .leftJoin(licenses, eq(licenses.orderId, orders.id))
    .where(eq(sql`lower(${orders.email})`, email.toLowerCase()))
    .orderBy(desc(orders.createdAt));
}

/** Look up an active license by its stored hash (for validation). */
export async function findLicenseByHash(keyHash: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(licenses)
    .where(eq(licenses.keyHash, keyHash))
    .limit(1);
  return rows[0] ?? null;
}

/** Record a received webhook for audit + idempotency. Returns false if the
 *  (provider, eventId) pair was already seen. */
export async function recordWebhookEvent(input: {
  provider: string;
  eventId: string;
  eventName: string;
  signatureValid: boolean;
  payload: unknown;
}): Promise<{ firstSeen: boolean }> {
  const db = getDb();
  const res = await db
    .insert(webhookEvents)
    .values({
      provider: input.provider,
      eventId: input.eventId,
      eventName: input.eventName,
      signatureValid: input.signatureValid,
      payload: input.payload as object,
    })
    .onConflictDoNothing({
      target: [webhookEvents.provider, webhookEvents.eventId],
    })
    .returning({ id: webhookEvents.id });
  return { firstSeen: res.length > 0 };
}

/** Mark a previously-recorded webhook event processed (or errored). */
export async function markWebhookProcessed(
  provider: string,
  eventId: string,
  error?: string,
): Promise<void> {
  const db = getDb();
  await db
    .update(webhookEvents)
    .set({ processed: !error, error: error ?? null })
    .where(
      and(
        eq(webhookEvents.provider, provider),
        eq(webhookEvents.eventId, eventId),
      ),
    );
}
