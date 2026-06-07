import "server-only";
import { Resend } from "resend";
import { env, features, publicEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { siteConfig } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

let resend: Resend | null = null;
function client(): Resend {
  if (!resend) resend = new Resend(env.RESEND_API_KEY!);
  return resend;
}

type SendResult = { id?: string; skipped?: boolean; error?: string };

async function send(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  if (!features.resend) {
    logger.warn("Email skipped — RESEND_API_KEY not set", {
      to: args.to,
      subject: args.subject,
    });
    return { skipped: true };
  }
  try {
    const { data, error } = await client().emails.send({
      from: env.EMAIL_FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo: args.replyTo,
    });
    if (error) {
      logger.error("Resend send failed", { error: error.message });
      return { error: error.message };
    }
    return { id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    logger.error("Resend threw", { message });
    return { error: message };
  }
}

/** Shared, email-client-friendly HTML shell (light theme is intentional). */
function layout(title: string, inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a2e;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="font-size:18px;font-weight:600;color:#5b3df5;margin-bottom:8px;">PrivateCode</div>
    <div style="background:#ffffff;border:1px solid #e6e6ef;border-radius:14px;padding:28px;">
      <h1 style="margin:0 0 16px;font-size:20px;">${title}</h1>
      ${inner}
    </div>
    <p style="color:#8a8aa0;font-size:12px;margin-top:20px;text-align:center;">
      ${siteConfig.name} · Local-first AI coding · <a href="${siteConfig.url}" style="color:#8a8aa0;">${siteConfig.domain}</a>
    </p>
  </div></body></html>`;
}

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#5b3df5;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;">${label}</a>`;

export async function sendLicenseEmail(args: {
  to: string;
  licenseKey: string;
  amountCents: number;
  currency: string;
}): Promise<SendResult> {
  const portal = `${publicEnv.NEXT_PUBLIC_APP_URL}/dashboard`;
  const download = `${siteConfig.repo}/releases/latest`;
  const html = layout(
    "Your PrivateCode license 🎉",
    `<p style="margin:0 0 16px;line-height:1.6;">Thanks for your purchase! Your lifetime license is ready. Paste this key into PrivateCode to activate.</p>
     <div style="background:#0d0f1a;color:#e7e9f3;font-family:ui-monospace,monospace;font-size:16px;letter-spacing:1px;padding:16px;border-radius:10px;text-align:center;margin:0 0 20px;">${args.licenseKey}</div>
     <p style="margin:0 0 8px;color:#6a6a80;font-size:13px;">Amount paid: ${formatCurrency(args.amountCents, args.currency)}</p>
     <p style="margin:0 0 24px;color:#6a6a80;font-size:13px;">Keep this key safe — we store it only as a one-way hash and cannot recover the plaintext. You can always re-download builds from your portal.</p>
     <p style="margin:0 0 12px;">${button(download, "Download PrivateCode")}</p>
     <p style="margin:0;font-size:13px;"><a href="${portal}" style="color:#5b3df5;">Open your license portal →</a></p>`,
  );
  const text = `Your PrivateCode license

License key: ${args.licenseKey}
Amount paid: ${formatCurrency(args.amountCents, args.currency)}

Download: ${download}
Portal: ${portal}

Keep this key safe — we store only a one-way hash and cannot recover it.`;
  return send({
    to: args.to,
    subject: "Your PrivateCode license key",
    html,
    text,
  });
}

export async function sendRefundEmail(args: {
  to: string;
  orderId: string;
}): Promise<SendResult> {
  const html = layout(
    "Your refund is confirmed",
    `<p style="margin:0 0 16px;line-height:1.6;">We've processed a refund for order <strong>${args.orderId}</strong>. The associated license has been deactivated.</p>
     <p style="margin:0;line-height:1.6;">It can take 5–10 business days to appear on your statement. Sorry to see you go — reply any time and we'll help.</p>`,
  );
  const text = `Your refund for order ${args.orderId} is confirmed. The associated license has been deactivated. Refunds take 5–10 business days to appear.`;
  return send({ to: args.to, subject: "Your PrivateCode refund", html, text });
}

export async function sendContactEmail(args: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<SendResult> {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = layout(
    `Support: ${esc(args.subject)}`,
    `<p style="margin:0 0 8px;"><strong>From:</strong> ${esc(args.name)} &lt;${esc(args.email)}&gt;</p>
     <p style="margin:0 0 16px;"><strong>Subject:</strong> ${esc(args.subject)}</p>
     <div style="white-space:pre-wrap;line-height:1.6;border-top:1px solid #e6e6ef;padding-top:16px;">${esc(args.message)}</div>`,
  );
  const text = `From: ${args.name} <${args.email}>\nSubject: ${args.subject}\n\n${args.message}`;
  return send({
    to: env.SUPPORT_EMAIL,
    subject: `[Support] ${args.subject}`,
    html,
    text,
    replyTo: args.email,
  });
}
