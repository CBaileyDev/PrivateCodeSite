import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { extractOrder, verifyWebhookSignature } from "@/lib/lemonsqueezy";
import { lemonWebhookSchema } from "@/lib/validations";

const SECRET = "test_webhook_secret"; // mirrors vitest.config.ts test.env

function sign(body: string): string {
  return createHmac("sha256", SECRET).update(body, "utf8").digest("hex");
}

describe("verifyWebhookSignature", () => {
  const body = JSON.stringify({ meta: { event_name: "order_created" } });

  it("accepts a correctly-signed body", () => {
    expect(verifyWebhookSignature(body, sign(body))).toBe(true);
  });

  it("rejects a tampered body", () => {
    const sig = sign(body);
    expect(verifyWebhookSignature(body + " ", sig)).toBe(false);
  });

  it("rejects a wrong signature", () => {
    expect(verifyWebhookSignature(body, sign("different"))).toBe(false);
  });

  it("rejects missing / malformed signatures", () => {
    expect(verifyWebhookSignature(body, null)).toBe(false);
    expect(verifyWebhookSignature(body, "")).toBe(false);
    expect(verifyWebhookSignature(body, "zzzz")).toBe(false);
  });
});

describe("extractOrder", () => {
  it("pulls normalized fields from an order_created payload", () => {
    const payload = lemonWebhookSchema.parse({
      meta: { event_name: "order_created" },
      data: {
        id: "12345",
        type: "orders",
        attributes: {
          user_email: "buyer@example.com",
          total: 8900,
          currency: "USD",
          status: "paid",
          refunded: false,
          first_order_item: { variant_id: 998877 },
          urls: { receipt: "https://app.lemonsqueezy.com/receipt/abc" },
        },
      },
    });

    expect(extractOrder(payload)).toEqual({
      providerOrderId: "12345",
      email: "buyer@example.com",
      amountCents: 8900,
      currency: "USD",
      variantId: "998877",
      receiptUrl: "https://app.lemonsqueezy.com/receipt/abc",
      refunded: false,
    });
  });

  it("detects refunds and tolerates missing fields", () => {
    const payload = lemonWebhookSchema.parse({
      meta: { event_name: "order_refunded" },
      data: { id: "9", type: "orders", attributes: { status: "refunded" } },
    });
    const order = extractOrder(payload);
    expect(order.refunded).toBe(true);
    expect(order.currency).toBe("USD");
    expect(order.variantId).toBeNull();
    expect(order.amountCents).toBe(0);
  });
});
