import type { Metadata } from "next";
import { PageHeader, PageShell, Prose } from "@/components/site/page-shell";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${siteConfig.name}.`,
  alternates: { canonical: "/legal/terms" },
};

const updated = "June 7, 2026";

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader title="Terms of Service" />
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Last updated: {updated}
      </p>

      <Prose className="mt-12">
        <p>
          These Terms of Service (“Terms”) govern your purchase and use of{" "}
          {siteConfig.name} (the “Software”) and this website. By purchasing or
          using the Software, you agree to these Terms. This document is a
          starting template and should be reviewed by legal counsel before
          launch.
        </p>

        <h2>1. License</h2>
        <p>
          Subject to your payment and ongoing compliance with these Terms, we
          grant you a non-exclusive, non-transferable, perpetual license to
          install and use the Software for your own development work. A one-time
          purchase includes the update window stated at checkout.
        </p>

        <h2>2. Restrictions</h2>
        <ul>
          <li>Do not resell, sublicense, or redistribute license keys.</li>
          <li>
            Do not circumvent licensing, activation, or validation mechanisms.
          </li>
          <li>
            Do not reverse engineer the Software except where that right cannot
            be lawfully restricted.
          </li>
        </ul>

        <h2>3. Bring-your-own-key &amp; third-party models</h2>
        <p>
          The Software is local-first and connects directly to the model
          providers you configure. You are responsible for your use of those
          providers and for any fees, keys, and terms that apply to them. We do
          not proxy, store, or transmit your code or API keys.
        </p>

        <h2>4. Payments</h2>
        <p>
          Payments are processed by our merchant of record, Lemon Squeezy, who
          handles billing, tax, and card data. We never receive or store your
          full payment-card details.
        </p>

        <h2>5. Refunds</h2>
        <p>
          Refunds are governed by our <a href="/legal/refund">Refund Policy</a>.
        </p>

        <h2>6. Warranty disclaimer</h2>
        <p>
          The Software is provided “as is” without warranties of any kind, to
          the maximum extent permitted by law.
        </p>

        <h2>7. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, our aggregate liability is
          limited to the amount you paid for the Software in the 12 months
          preceding the claim.
        </p>

        <h2>8. Changes</h2>
        <p>
          We may update these Terms from time to time. Material changes will be
          reflected by the “last updated” date above.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions about these Terms? Reach us via the{" "}
          <a href="/support">support page</a>.
        </p>
      </Prose>
    </PageShell>
  );
}
