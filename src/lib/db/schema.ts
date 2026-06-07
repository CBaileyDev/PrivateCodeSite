import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Minimal customer record, keyed by email. Stores as little PII as possible. */
export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    // Optional link to a Supabase auth user (for the portal).
    authUserId: uuid("auth_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("users_email_unique").on(sql`lower(${t.email})`)],
);

/** A completed purchase from the payment provider. */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("lemonsqueezy"),
    providerOrderId: text("provider_order_id").notNull(),
    variantId: text("variant_id"),
    email: text("email").notNull(),
    // paid | refunded | partial_refund | pending
    status: text("status").notNull().default("paid"),
    amountCents: integer("amount_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    receiptUrl: text("receipt_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_provider_order_unique").on(
      t.provider,
      t.providerOrderId,
    ),
  ],
);

/** Issued license. Only the HMAC hash of the key is stored — never plaintext. */
export const licenses = pgTable(
  "licenses",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    keyHash: text("key_hash").notNull(),
    // Masked, display-only representation (e.g. PVTC-AB3K9-…-7K9Q).
    displayKey: text("display_key").notNull(),
    // active | revoked | refunded
    status: text("status").notNull().default("active"),
    activationLimit: integer("activation_limit").notNull().default(3),
    activations: integer("activations").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("licenses_key_hash_unique").on(t.keyHash)],
);

/** Append-only audit log of every webhook we receive, for idempotency + forensics. */
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    eventName: text("event_name").notNull(),
    signatureValid: boolean("signature_valid").notNull(),
    processed: boolean("processed").notNull().default(false),
    error: text("error"),
    payload: jsonb("payload").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("webhook_events_provider_event_unique").on(
      t.provider,
      t.eventId,
    ),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
