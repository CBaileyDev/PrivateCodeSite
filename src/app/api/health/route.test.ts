import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  features: {
    database: false,
    lemonSqueezy: false,
    lemonSqueezyWebhook: false,
    resend: false,
    rateLimit: false,
  },
}));

import { GET } from "@/app/api/health/route";

describe("health route", () => {
  it("does not advertise a removed authentication integration", async () => {
    const response = GET();
    const body = await response.json();

    expect(body.integrations).not.toHaveProperty("auth");
  });
});
