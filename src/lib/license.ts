import "server-only";
import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/lib/env";

/**
 * License keys.
 *
 * Format: `PVTC-XXXXX-XXXXX-XXXXX-XXXXX` where X is a Crockford base32
 * character (no ambiguous I/L/O/U). The plaintext key is shown to the customer
 * exactly once (email + the success page handoff) and is NEVER stored. We
 * persist only an HMAC-SHA256 hash, peppered with a server secret, so a
 * database leak does not expose usable keys.
 */

const PREFIX = "PVTC";
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32
const GROUPS = 4;
const GROUP_LEN = 5;

/** Generate a cryptographically random, formatted license key. */
export function generateLicenseKey(): string {
  const groups: string[] = [];
  for (let g = 0; g < GROUPS; g++) {
    const bytes = randomBytes(GROUP_LEN);
    let group = "";
    for (let i = 0; i < GROUP_LEN; i++) {
      group += ALPHABET[bytes[i] % ALPHABET.length];
    }
    groups.push(group);
  }
  return [PREFIX, ...groups].join("-");
}

/** Normalize user-supplied keys (uppercase, strip spaces) before hashing. */
export function normalizeLicenseKey(key: string): string {
  return key.trim().toUpperCase().replace(/\s+/g, "");
}

/** Deterministic, peppered hash used for storage and lookups. */
export function hashLicenseKey(key: string): string {
  return createHmac("sha256", env.LICENSE_HASH_SECRET)
    .update(normalizeLicenseKey(key))
    .digest("hex");
}

/** Constant-time comparison of a candidate key against a stored hash. */
export function verifyLicenseKey(
  candidate: string,
  storedHash: string,
): boolean {
  const candidateHash = hashLicenseKey(candidate);
  const a = Buffer.from(candidateHash, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Structural sanity check (does not prove validity). */
export function isWellFormedLicenseKey(key: string): boolean {
  const re = new RegExp(
    `^${PREFIX}(?:-[${ALPHABET}]{${GROUP_LEN}}){${GROUPS}}$`,
  );
  return re.test(normalizeLicenseKey(key));
}

/** Generate a fresh key plus its storable hash in one step. */
export function issueLicense(): { key: string; keyHash: string; id: string } {
  const key = generateLicenseKey();
  return { key, keyHash: hashLicenseKey(key), id: randomUUID() };
}
