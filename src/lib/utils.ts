import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts predictably. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format an integer number of cents into a localized currency string. */
export function formatCurrency(
  cents: number,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Mask a license key for display, e.g. `PVTC-XXXX-...-7K9Q`. */
export function maskLicenseKey(key: string): string {
  const parts = key.split("-");
  if (parts.length < 3) return key;
  return `${parts[0]}-${parts[1]}-…-${parts[parts.length - 1]}`;
}
