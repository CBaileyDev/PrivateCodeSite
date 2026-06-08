import { describe, expect, it } from "vitest";
import { shouldEnableVercelInsights } from "@/lib/analytics";

describe("shouldEnableVercelInsights", () => {
  it("enables Vercel telemetry only on Vercel deployments", () => {
    expect(shouldEnableVercelInsights("1")).toBe(true);
    expect(shouldEnableVercelInsights("")).toBe(false);
    expect(shouldEnableVercelInsights()).toBe(false);
  });
});
