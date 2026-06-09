import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activateLicenseByHash: vi.fn(),
  findLicenseByHash: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  features: { database: true },
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "127.0.0.1",
  rateLimit: () =>
    Promise.resolve({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60_000,
    }),
  rateLimitHeaders: () => ({}),
}));

vi.mock("@/lib/license", () => ({
  hashLicenseKey: () => "license-hash",
}));

vi.mock("@/lib/db/queries", () => ({
  activateLicenseByHash: mocks.activateLicenseByHash,
  findLicenseByHash: mocks.findLicenseByHash,
}));

import { GET, POST } from "@/app/api/license/validate/route";

const key = "PVTC-ABCDE-FGHJK-MNPQR-STVWX";

describe("license validation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findLicenseByHash.mockResolvedValue({
      status: "active",
      expiresAt: null,
      activationLimit: 1,
    });
  });

  it("requires a machine instance id so activation limits cannot be bypassed", async () => {
    const response = await GET(
      new Request(
        `http://localhost/api/license/validate?key=${encodeURIComponent(key)}`,
      ),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      valid: false,
      reason: "invalid_request",
    });
  });

  it("returns the activation-limit failure from the atomic database check", async () => {
    mocks.activateLicenseByHash.mockResolvedValue({
      valid: false,
      reason: "activation_limit",
    });

    const response = await GET(
      new Request(
        `http://localhost/api/license/validate?key=${encodeURIComponent(key)}&instanceId=machine-b`,
      ),
    );

    expect(response.status).toBe(200);
    expect(mocks.activateLicenseByHash).toHaveBeenCalledWith({
      keyHash: "license-hash",
      instanceId: "machine-b",
      instanceName: undefined,
    });
    await expect(response.json()).resolves.toEqual({
      valid: false,
      reason: "activation_limit",
    });
  });

  it("accepts the key via POST body so it never appears in a URL", async () => {
    mocks.activateLicenseByHash.mockResolvedValue({
      valid: true,
      license: {
        status: "active",
        expiresAt: null,
        activationLimit: 3,
        activations: 1,
      },
    });

    const response = await POST(
      new Request("http://localhost/api/license/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, instanceId: "machine-a" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.activateLicenseByHash).toHaveBeenCalledWith({
      keyHash: "license-hash",
      instanceId: "machine-a",
      instanceName: undefined,
    });
    await expect(response.json()).resolves.toMatchObject({ valid: true });
  });

  it("rejects a malformed POST body", async () => {
    const response = await POST(
      new Request("http://localhost/api/license/validate", {
        method: "POST",
        body: "not json",
      }),
    );

    expect(response.status).toBe(422);
    expect(mocks.activateLicenseByHash).not.toHaveBeenCalled();
  });
});
