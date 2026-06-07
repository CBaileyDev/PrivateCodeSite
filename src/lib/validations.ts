import { z } from "zod";

/** Shared input schemas. Every public endpoint and form validates against one
 *  of these, with explicit length bounds to keep payloads sane. */

export const checkoutSchema = z.object({
  // Optional — used to pre-fill the hosted checkout. Lemon Squeezy remains the
  // source of truth for the real billing email.
  email: z.string().trim().email().max(254).optional(),
  // Optional discount / variant override (server re-validates against config).
  variantId: z.string().trim().max(64).optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(254),
  subject: z.string().trim().min(3, "Add a short subject").max(120),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (10+ characters)")
    .max(4000, "Message is too long"),
  // Honeypot — real users never fill this. Accepted by the schema but the
  // server action silently drops any submission where it is non-empty.
  company: z.string().max(200).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const licenseValidateSchema = z.object({
  key: z.string().trim().min(8).max(64),
  // Optional machine fingerprint from the desktop app.
  instanceId: z.string().trim().max(128).optional(),
  instanceName: z.string().trim().max(128).optional(),
});
export type LicenseValidateInput = z.infer<typeof licenseValidateSchema>;

/**
 * Lemon Squeezy webhook envelope (loosely typed — we only read what we need and
 * tolerate extra fields, since the signed body is the security boundary).
 */
export const lemonWebhookSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: z.record(z.string(), z.unknown()).optional(),
  }),
  data: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.record(z.string(), z.unknown()),
  }),
});
export type LemonWebhook = z.infer<typeof lemonWebhookSchema>;
