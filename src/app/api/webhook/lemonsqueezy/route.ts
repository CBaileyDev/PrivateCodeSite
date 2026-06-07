import { features } from "@/lib/env";
import { error, json } from "@/lib/http";
import { logger } from "@/lib/logger";
import { extractOrder, verifyWebhookSignature } from "@/lib/lemonsqueezy";
import { lemonWebhookSchema } from "@/lib/validations";
import { issueLicense } from "@/lib/license";
import { maskLicenseKey } from "@/lib/utils";
import {
  markWebhookProcessed,
  recordOrderWithLicense,
  recordWebhookEvent,
  refundOrder,
} from "@/lib/db/queries";
import { sendLicenseEmail, sendRefundEmail } from "@/lib/email";

export const runtime = "nodejs";
// Webhooks must always be processed fresh.
export const dynamic = "force-dynamic";

const PROVIDER = "lemonsqueezy";

export async function POST(request: Request) {
  // 1. Read the RAW body first — signature verification depends on the exact bytes.
  const raw = await request.text();
  const signature = request.headers.get("x-signature");

  if (!features.lemonSqueezyWebhook) {
    logger.error("Webhook received but LEMONSQUEEZY_WEBHOOK_SECRET is unset");
    return error("Webhook not configured", 503);
  }

  // 2. Verify HMAC signature (constant-time). Reject anything unsigned/forged.
  if (!verifyWebhookSignature(raw, signature)) {
    logger.warn("Rejected webhook with invalid signature");
    return error("Invalid signature", 401);
  }

  // 3. Parse + validate shape.
  let payload;
  try {
    payload = lemonWebhookSchema.parse(JSON.parse(raw));
  } catch {
    return error("Malformed payload", 400);
  }

  const eventName = payload.meta.event_name;
  const eventId = `${eventName}:${payload.data.id}`;

  // Without a database we can acknowledge but cannot fulfill/persist.
  if (!features.database) {
    logger.warn("Webhook acknowledged but not persisted (DATABASE_URL unset)", {
      eventName,
      eventId,
    });
    return json({ received: true, persisted: false });
  }

  // 4. Idempotency: record the event; bail if we've already seen it.
  try {
    const { firstSeen } = await recordWebhookEvent({
      provider: PROVIDER,
      eventId,
      eventName,
      signatureValid: true,
      payload,
    });
    if (!firstSeen) {
      logger.info("Duplicate webhook ignored", { eventId });
      return json({ received: true, duplicate: true });
    }
  } catch (err) {
    logger.error("Failed to record webhook event", {
      eventId,
      message: err instanceof Error ? err.message : "unknown",
    });
    return error("Storage error", 500); // 5xx → provider will retry.
  }

  // 5. Handle the event.
  try {
    switch (eventName) {
      case "order_created": {
        const o = extractOrder(payload);
        if (o.refunded) {
          // A created-but-already-refunded edge case.
          await refundOrder(PROVIDER, o.providerOrderId);
          break;
        }
        const lic = issueLicense();
        const { isNew } = await recordOrderWithLicense({
          email: o.email,
          provider: PROVIDER,
          providerOrderId: o.providerOrderId,
          variantId: o.variantId,
          amountCents: o.amountCents,
          currency: o.currency,
          receiptUrl: o.receiptUrl,
          license: {
            keyHash: lic.keyHash,
            displayKey: maskLicenseKey(lic.key),
          },
        });
        // Only email the plaintext key the first time we fulfill this order.
        if (isNew && o.email) {
          const res = await sendLicenseEmail({
            to: o.email,
            licenseKey: lic.key,
            amountCents: o.amountCents,
            currency: o.currency,
          });
          if (res.error) {
            logger.error("License email failed (order still fulfilled)", {
              eventId,
            });
          }
        }
        break;
      }

      case "order_refunded": {
        const o = extractOrder(payload);
        const found = await refundOrder(PROVIDER, o.providerOrderId);
        if (found && o.email) {
          await sendRefundEmail({ to: o.email, orderId: o.providerOrderId });
        }
        break;
      }

      default:
        // We only sell one-time products; ignore subscription/other events.
        logger.info("Unhandled webhook event", { eventName });
    }

    await markWebhookProcessed(PROVIDER, eventId);
    return json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    logger.error("Webhook processing failed", { eventId, message });
    await markWebhookProcessed(PROVIDER, eventId, message).catch(() => {});
    return error("Processing error", 500); // Let the provider retry.
  }
}
