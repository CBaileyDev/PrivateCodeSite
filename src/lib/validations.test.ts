import { describe, expect, it } from "vitest";
import {
  checkoutSchema,
  contactSchema,
  licenseValidateSchema,
} from "@/lib/validations";

describe("contactSchema", () => {
  const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    subject: "Activation help",
    message: "I can't activate my license on Linux.",
    company: "",
  };

  it("accepts a valid message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const r = contactSchema.safeParse({ ...valid, email: "nope" });
    expect(r.success).toBe(false);
  });

  it("rejects too-short name and message", () => {
    expect(contactSchema.safeParse({ ...valid, name: "A" }).success).toBe(
      false,
    );
    expect(
      contactSchema.safeParse({ ...valid, message: "short" }).success,
    ).toBe(false);
  });

  it("enforces upper length bounds", () => {
    expect(
      contactSchema.safeParse({ ...valid, message: "x".repeat(4001) }).success,
    ).toBe(false);
  });

  it("still parses when the honeypot is filled (dropped later by the action)", () => {
    const r = contactSchema.safeParse({ ...valid, company: "bot inc" });
    expect(r.success).toBe(true);
  });
});

describe("checkoutSchema", () => {
  it("allows an empty body", () => {
    expect(checkoutSchema.safeParse({}).success).toBe(true);
  });
  it("validates an optional email", () => {
    expect(checkoutSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(checkoutSchema.safeParse({ email: "bad" }).success).toBe(false);
  });
  it("rejects client-controlled product variants", () => {
    expect(
      checkoutSchema.safeParse({ variantId: "cheaper-variant" }).success,
    ).toBe(false);
  });
});

describe("licenseValidateSchema", () => {
  it("requires a key of reasonable length", () => {
    expect(licenseValidateSchema.safeParse({ key: "short" }).success).toBe(
      false,
    );
    expect(
      licenseValidateSchema.safeParse({
        key: "PVTC-ABCDE-FGHJK-MNPQR-STVWX",
        instanceId: "machine-a",
      }).success,
    ).toBe(true);
  });

  it("requires an instance id to enforce activation limits", () => {
    expect(
      licenseValidateSchema.safeParse({
        key: "PVTC-ABCDE-FGHJK-MNPQR-STVWX",
      }).success,
    ).toBe(false);
    expect(
      licenseValidateSchema.safeParse({
        key: "PVTC-ABCDE-FGHJK-MNPQR-STVWX",
        instanceId: "machine-a",
      }).success,
    ).toBe(true);
  });
});
