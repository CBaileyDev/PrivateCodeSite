import type { Metadata } from "next";
import { PageHeader, PageShell, Prose } from "@/components/site/page-shell";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `Refund Policy for ${siteConfig.name}.`,
  alternates: { canonical: "/legal/refund" },
};

const updated = "June 7, 2026";

export default function RefundPage() {
  return (
    <PageShell>
      <PageHeader title="Refund Policy" />
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Last updated: {updated}
      </p>

      <Prose className="mt-12">
        <h2>14-day money-back guarantee</h2>
        <p>
          If {siteConfig.name} isn’t the right fit, email us within{" "}
          <strong>14 days</strong> of your purchase and we’ll issue a full,
          no-questions-asked refund.
        </p>

        <h2>How to request a refund</h2>
        <p>
          Send a note from the <a href="/support">support page</a> using the
          email address you purchased with, and include your order number if you
          have it. Refunds are processed back to your original payment method by
          our merchant of record, Lemon Squeezy.
        </p>

        <h2>After a refund</h2>
        <ul>
          <li>
            Your license key is deactivated and can no longer be validated.
          </li>
          <li>
            Refunds typically appear on your statement within 5–10 business
            days, depending on your bank.
          </li>
        </ul>

        <h2>Abuse</h2>
        <p>
          We reserve the right to decline refunds where we detect fraud or abuse
          of this policy (for example, repeated buy-refund cycles).
        </p>

        <p>
          This policy is a starting template and does not limit any non-waivable
          statutory rights you may have in your jurisdiction.
        </p>
      </Prose>
    </PageShell>
  );
}
