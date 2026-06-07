import { Hero } from "@/components/marketing/hero";
import { Performance } from "@/components/marketing/performance";
import { Features } from "@/components/marketing/features";
import { Comparison } from "@/components/marketing/comparison";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { Cta } from "@/components/marketing/cta";
import { faqs, pricing, siteConfig } from "@/lib/constants";

// Marketing pages are statically rendered and revalidated hourly (ISR).
export const revalidate = 3600;

function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        sameAs: [siteConfig.repo],
      },
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "macOS, Linux, Windows",
        description: siteConfig.description,
        offers: {
          "@type": "Offer",
          price: (pricing.amountCents / 100).toFixed(2),
          priceCurrency: pricing.currency,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD is static, trusted content built from our own constants.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <Hero />
      <Performance />
      <Features />
      <Comparison />
      <Pricing />
      <Faq />
      <Cta />
    </>
  );
}
