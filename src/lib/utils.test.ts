import { describe, expect, it } from "vitest";
import { cn, formatCurrency, maskLicenseKey } from "@/lib/utils";

describe("cn", () => {
  it("merges and dedupes conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe(
      "text-sm font-bold",
    );
  });
});

describe("formatCurrency", () => {
  it("formats cents as localized currency", () => {
    expect(formatCurrency(8900, "USD")).toBe("$89.00");
    expect(formatCurrency(0, "USD")).toBe("$0.00");
  });
});

describe("maskLicenseKey", () => {
  it("masks the middle of a key", () => {
    expect(maskLicenseKey("PVTC-ABCDE-FGHJK-MNPQR-STVWX")).toBe(
      "PVTC-ABCDE-…-STVWX",
    );
  });
  it("returns short inputs unchanged", () => {
    expect(maskLicenseKey("PVTC")).toBe("PVTC");
  });
});
