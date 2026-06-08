import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  licenseActivations,
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
    if (found[0].status === (partial ? "partial_refund" : "refunded")) {
      return false;
    }

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

export type LicenseActivationResult =
  | {
      valid: true;
      license: License;
    }
  | {
      valid: false;
      reason:
        | "not_found"
        | "revoked"
        | "refunded"
        | "expired"
        | "activation_limit";
    };

/** Validate a license and atomically claim/reuse a machine activation. */
export async function activateLicenseByHash(input: {
  keyHash: string;
  instanceId: string;
  instanceName?: string;
}): Promise<LicenseActivationResult> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const license = (
      await tx
        .select()
        .from(licenses)
        .where(eq(licenses.keyHash, input.keyHash))
        .limit(1)
        .for("update")
    )[0];

    if (!license) return { valid: false, reason: "not_found" };
    if (license.status !== "active") {
      return {
        valid: false,
        reason: license.status === "refunded" ? "refunded" : "revoked",
      };
    }
    if (license.expiresAt && license.expiresAt.getTime() < Date.now()) {
      return { valid: false, reason: "expired" };
    }

    const existingActivation = (
      await tx
        .select()
        .from(licenseActivations)
        .where(
          and(
            eq(licenseActivations.licenseId, license.id),
            eq(licenseActivations.instanceId, input.instanceId),
          ),
        )
        .limit(1)
    )[0];

    if (existingActivation) {
      await tx
        .update(licenseActivations)
        .set({
          instanceName: input.instanceName ?? existingActivation.instanceName,
          lastSeenAt: new Date(),
        })
        .where(eq(licenseActivations.id, existingActivation.id));
      return { valid: true, license };
    }

    if (license.activations >= license.activationLimit) {
      return { valid: false, reason: "activation_limit" };
    }

    await tx.insert(licenseActivations).values({
      licenseId: license.id,
      instanceId: input.instanceId,
      instanceName: input.instanceName ?? null,
    });

    const updatedLicense = (
      await tx
        .update(licenses)
        .set({
          activations: sql`${licenses.activations} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(licenses.id, license.id))
        .returning()
    )[0]!;

    return { valid: true, license: updatedLicense };
  });
}

/** Record a received webhook for audit + idempotency. Returns false if the
 *  (provider, eventId) pair was already seen. */
export async function recordWebhookEvent(input: {
  provider: string;
  eventId: string;
  eventName: string;
  signatureValid: boolean;
  payload: unknown;
}): Promise<{ firstSeen: boolean; processed: boolean; error: string | null }> {
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
  if (res.length > 0) {
    return { firstSeen: true, processed: false, error: null };
  }

  const existing = await db
    .select({
      processed: webhookEvents.processed,
      error: webhookEvents.error,
    })
    .from(webhookEvents)
    .where(
      and(
        eq(webhookEvents.provider, input.provider),
        eq(webhookEvents.eventId, input.eventId),
      ),
    )
    .limit(1);

  return {
    firstSeen: false,
    processed: existing[0]?.processed ?? true,
    error: existing[0]?.error ?? null,
  };
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
