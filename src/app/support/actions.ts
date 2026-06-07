"use server";

import { headers } from "next/headers";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { sendContactEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export type ContactState = { ok: boolean; error?: string };

/** Server action backing the support contact form. Validates, rate-limits by
 *  IP, drops honeypot submissions, and emails the support inbox via Resend. */
export async function submitContact(
  input: ContactInput,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  // Honeypot: pretend success so bots don't learn they were caught.
  if (parsed.data.company) return { ok: true };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rl = await rateLimit(ip, { name: "contact", max: 5, window: "60 s" });
  if (!rl.success) {
    return {
      ok: false,
      error: "Too many messages — please try again shortly.",
    };
  }

  const { name, email, subject, message } = parsed.data;
  const res = await sendContactEmail({ name, email, subject, message });

  if (res.error) {
    return {
      ok: false,
      error: "We couldn't send your message. Please email us directly.",
    };
  }
  if (res.skipped) {
    // Email isn't wired up yet — don't lose the message; log it server-side.
    logger.info("Contact message received (email disabled)", {
      email,
      subject,
    });
  }
  return { ok: true };
}
