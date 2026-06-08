import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  extractOrder: vi.fn(),
  markWebhookProcessed: vi.fn(),
  recordOrderWithLicense: vi.fn(),
  recordWebhookEvent: vi.fn(),
  refundOrder: vi.fn(),
  sendLicenseEmail: vi.fn(),
  sendRefundEmail: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  env: { LEMONSQUEEZY_VARIANT_ID: "variant-allowed" },
  features: {
    database: true,
    lemonSqueezyWebhook: true,
  },
}));

vi.mock("@/lib/lemonsqueezy", () => ({
  extractOrder: mocks.extractOrder,
  verifyWebhookSignature: () => true,
}));

vi.mock("@/lib/db/queries", () => ({
  markWebhookProcessed: mocks.markWebhookProcessed,
  recordOrderWithLicense: mocks.recordOrderWithLicense,
  recordWebhookEvent: mocks.recordWebhookEvent,
  refundOrder: mocks.refundOrder,
}));

vi.mock("@/lib/email", () => ({
  sendLicenseEmail: mocks.sendLicenseEmail,
  sendRefundEmail: mocks.sendRefundEmail,
}));

vi.mock("@/lib/license", () => ({
  issueLicense: () => ({
    id: "license-id",
    key: "PVTC-ABCDE-FGHJK-MNPQR-STVWX",
    keyHash: "license-hash",
  }),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  maskLicenseKey: () => "PVTC-ABCDE-…-STVWX",
}));

import { POST } from "@/app/api/webhook/lemonsqueezy/route";

const payload = {
  meta: { event_name: "order_created" },
  data: {
    id: "order-123",
    type: "orders",
    attributes: {},
  },
};

function request() {
  return new Request("http://localhost/api/webhook/lemonsqueezy", {
    method: "POST",
    headers: { "x-signature": "valid" },
    body: JSON.stringify(payload),
  });
}

describe("Lemon Squeezy webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.extractOrder.mockReturnValue({
      providerOrderId: "order-123",
      email: "buyer@example.com",
      amountCents: 8900,
      currency: "USD",
      variantId: "variant-allowed",
      receiptUrl: null,
      refunded: false,
    });
    mocks.markWebhookProcessed.mockResolvedValue(undefined);
    mocks.recordOrderWithLicense.mockResolvedValue({ isNew: false });
    mocks.refundOrder.mockResolvedValue(false);
    mocks.sendLicenseEmail.mockResolvedValue({ error: null });
    mocks.sendRefundEmail.mockResolvedValue({ error: null });
  });

  it("retries an existing webhook that has not been processed", async () => {
    mocks.recordWebhookEvent
      .mockResolvedValueOnce({ firstSeen: true, processed: false })
      .mockResolvedValueOnce({ firstSeen: false, processed: false });
    mocks.recordOrderWithLicense
      .mockRejectedValueOnce(new Error("temporary database failure"))
      .mockResolvedValueOnce({ isNew: false });

    const first = await POST(request());
    const retry = await POST(request());

    expect(first.status).toBe(500);
    expect(retry.status).toBe(200);
    expect(mocks.recordOrderWithLicense).toHaveBeenCalledTimes(2);
    await expect(retry.json()).resolves.toMatchObject({ received: true });
  });

  it("does not fulfill an order for a different product variant", async () => {
    mocks.recordWebhookEvent.mockResolvedValue({
      firstSeen: true,
      processed: false,
    });
    mocks.extractOrder.mockReturnValue({
      providerOrderId: "order-123",
      email: "buyer@example.com",
      amountCents: 100,
      currency: "USD",
      variantId: "variant-other",
      receiptUrl: null,
      refunded: false,
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.recordOrderWithLicense).not.toHaveBeenCalled();
    expect(mocks.markWebhookProcessed).toHaveBeenCalledWith(
      "lemonsqueezy",
      "order_created:order-123",
    );
    await expect(response.json()).resolves.toMatchObject({
      received: true,
      ignored: true,
    });
  });
});
