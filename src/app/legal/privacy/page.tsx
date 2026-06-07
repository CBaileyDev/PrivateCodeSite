import type { Metadata } from "next";
import { PageHeader, PageShell, Prose } from "@/components/site/page-shell";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.name}.`,
  alternates: { canonical: "/legal/privacy" },
};

const updated = "June 7, 2026";

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader title="Privacy Policy" />
      <p className="text-muted-foreground mt-4 text-center text-sm">
        Last updated: {updated}
      </p>

      <Prose className="mt-12">
        <p>
          {siteConfig.name} is built local-first. This policy explains what the{" "}
          <em>website and purchase flow</em> collect. It is a starting template
          and should be reviewed by legal counsel.
        </p>

        <h2>The short version</h2>
        <ul>
          <li>
            <strong>Your code and API keys never reach us.</strong> The Software
            talks directly to your chosen model providers. There is no telemetry
            and no proxied calls.
          </li>
          <li>
            We store the minimum needed to deliver and support your purchase: an
            email address, order metadata, and a one-way hash of your license
            key (never the plaintext key).
          </li>
        </ul>

        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Purchase data:</strong> handled by Lemon Squeezy (our
            merchant of record). We receive order metadata and your email — not
            your card details.
          </li>
          <li>
            <strong>Account data:</strong> if you use the license portal, your
            email and authentication session.
          </li>
          <li>
            <strong>Analytics:</strong> privacy-respecting, aggregate usage
            metrics for this website (e.g. page performance). No cross-site
            tracking.
          </li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To deliver your license and provide downloads.</li>
          <li>To provide support and process refunds.</li>
          <li>To detect abuse and secure our systems (e.g. rate limiting).</li>
        </ul>

        <h2>Data retention</h2>
        <p>
          We keep order and license records for as long as needed to support
          your purchase and to meet legal/accounting obligations, then delete or
          anonymize them.
        </p>

        <h2>Your rights (GDPR / CCPA)</h2>
        <p>
          Depending on where you live, you may have the right to access,
          correct, export, or delete your personal data, and to object to
          certain processing. To exercise these rights, contact us via the{" "}
          <a href="/support">support page</a>. We do not sell your personal
          information.
        </p>

        <h2>Sub-processors</h2>
        <ul>
          <li>Lemon Squeezy — payments &amp; billing</li>
          <li>Supabase — database &amp; authentication</li>
          <li>Resend — transactional email</li>
          <li>Vercel — hosting &amp; analytics</li>
        </ul>

        <h2>Contact</h2>
        <p>
          Questions about privacy? Reach us via the{" "}
          <a href="/support">support page</a>.
        </p>
      </Prose>
    </PageShell>
  );
}
