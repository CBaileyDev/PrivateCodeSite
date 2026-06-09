import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { ADMIN_API_KEY: "test-admin-key" },
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
  it("does not leak integration configuration to unauthenticated callers", async () => {
    const response = GET(new Request("http://localhost/api/health"));
    const body = await response.json();

    expect(body.status).toBe("ok");
    expect(body).not.toHaveProperty("integrations");
  });

  it("rejects a wrong admin key", async () => {
    const response = GET(
      new Request("http://localhost/api/health", {
        headers: { authorization: "Bearer wrong-key" },
      }),
    );
    const body = await response.json();

    expect(body).not.toHaveProperty("integrations");
  });

  it("reports integration status to the admin key holder", async () => {
    const response = GET(
      new Request("http://localhost/api/health", {
        headers: { authorization: "Bearer test-admin-key" },
      }),
    );
    const body = await response.json();

    expect(body.integrations).toEqual({
      database: false,
      payments: false,
      webhooks: false,
      email: false,
      rateLimit: false,
    });
    expect(body.integrations).not.toHaveProperty("auth");
  });
});
