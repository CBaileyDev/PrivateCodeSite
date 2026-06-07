import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env, features } from "@/lib/env";
import type { LemonWebhook } from "@/lib/validations";

const API_BASE = "https://api.lemonsqueezy.com/v1";

export class LemonSqueezyError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "LemonSqueezyError";
  }
}

/**
 * Create a hosted checkout and return its URL. The browser is redirected here;
 * we never see card data (PCI handled entirely by Lemon Squeezy).
 */
export async function createCheckout(params: {
  email?: string;
  redirectUrl: string;
  variantId?: string;
}): Promise<{ url: string }> {
  if (!features.lemonSqueezy) {
    throw new LemonSqueezyError("Lemon Squeezy is not configured", 503);
  }

  const variantId = params.variantId || env.LEMONSQUEEZY_VARIANT_ID!;

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: params.email,
          custom: { source: "privatecode-site" },
        },
        product_options: {
          redirect_url: params.redirectUrl,
          receipt_button_text: "Open license portal",
          enabled_variants: [Number(variantId)],
        },
        checkout_options: { embed: false, dark: true },
      },
      relationships: {
        store: {
          data: { type: "stores", id: String(env.LEMONSQUEEZY_STORE_ID) },
        },
        variant: { data: { type: "variants", id: String(variantId) } },
      },
    },
  };

  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new LemonSqueezyError(
      `Checkout creation failed (${res.status}): ${detail.slice(0, 200)}`,
      res.status,
    );
  }

  const json = (await res.json()) as {
    data?: { attributes?: { url?: string } };
  };
  const url = json.data?.attributes?.url;
  if (!url) throw new LemonSqueezyError("Checkout response missing URL");
  return { url };
}

/**
 * Verify a Lemon Squeezy webhook. The `X-Signature` header is the hex
 * HMAC-SHA256 of the *raw* request body, keyed by the signing secret.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature || !env.LEMONSQUEEZY_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", env.LEMONSQUEEZY_WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(signature, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Normalized fields we care about, extracted from an order webhook. */
export type NormalizedOrder = {
  providerOrderId: string;
  email: string;
  amountCents: number;
  currency: string;
  variantId: string | null;
  receiptUrl: string | null;
  refunded: boolean;
};

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
function num(v: unknown): number {
  return typeof v === "number" ? v : Number(v) || 0;
}

/** Extract order details from a Lemon Squeezy `order_*` webhook payload. */
export function extractOrder(payload: LemonWebhook): NormalizedOrder {
  const a = payload.data.attributes as Record<string, unknown>;
  const firstItem = (a.first_order_item ?? {}) as Record<string, unknown>;
  const urls = (a.urls ?? {}) as Record<string, unknown>;
  return {
    providerOrderId: payload.data.id,
    email: str(a.user_email) ?? "",
    amountCents: num(a.total),
    currency: str(a.currency) ?? "USD",
    variantId:
      firstItem.variant_id != null ? String(firstItem.variant_id) : null,
    receiptUrl: str(urls.receipt),
    refunded: a.refunded === true || str(a.status) === "refunded",
  };
}
