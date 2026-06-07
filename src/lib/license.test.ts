import { describe, expect, it } from "vitest";
import {
  generateLicenseKey,
  hashLicenseKey,
  isWellFormedLicenseKey,
  issueLicense,
  normalizeLicenseKey,
  verifyLicenseKey,
} from "@/lib/license";

describe("license keys", () => {
  it("generates well-formed, prefixed keys", () => {
    for (let i = 0; i < 50; i++) {
      const key = generateLicenseKey();
      expect(key).toMatch(/^PVTC(-[0-9A-HJKMNP-TV-Z]{5}){4}$/);
      expect(isWellFormedLicenseKey(key)).toBe(true);
    }
  });

  it("generates unique keys", () => {
    const set = new Set(
      Array.from({ length: 500 }, () => generateLicenseKey()),
    );
    expect(set.size).toBe(500);
  });

  it("normalizes case and whitespace", () => {
    expect(normalizeLicenseKey("  pvtc-abcde-fghjk-mnpqr-stvwx ")).toBe(
      "PVTC-ABCDE-FGHJK-MNPQR-STVWX",
    );
  });

  it("hashes deterministically and verifies in constant time", () => {
    const key = generateLicenseKey();
    const hash = hashLicenseKey(key);
    expect(hash).toHaveLength(64); // sha256 hex
    expect(hashLicenseKey(key)).toBe(hash);
    expect(verifyLicenseKey(key, hash)).toBe(true);
    // Case/whitespace-insensitive thanks to normalization.
    expect(verifyLicenseKey(` ${key.toLowerCase()} `, hash)).toBe(true);
  });

  it("rejects the wrong key", () => {
    const hash = hashLicenseKey(generateLicenseKey());
    expect(verifyLicenseKey(generateLicenseKey(), hash)).toBe(false);
    expect(verifyLicenseKey("not-a-key", hash)).toBe(false);
  });

  it("never exposes plaintext from issueLicense's hash", () => {
    const { key, keyHash } = issueLicense();
    expect(keyHash).not.toContain(key);
    expect(verifyLicenseKey(key, keyHash)).toBe(true);
  });

  it("rejects malformed keys structurally", () => {
    expect(isWellFormedLicenseKey("PVTC-IIIII-IIIII-IIIII-IIIII")).toBe(false); // I not in alphabet
    expect(isWellFormedLicenseKey("ABCD-12345-12345-12345-12345")).toBe(false);
    expect(isWellFormedLicenseKey("PVTC-123-456")).toBe(false);
  });
});
