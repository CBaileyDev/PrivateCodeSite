import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, BookOpen } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHeader, PageShell } from "@/components/site/page-shell";
import { Card } from "@/components/ui/card";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with PrivateCode — licensing, activation, billing, and technical questions.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <PageShell>
      <PageHeader
        title="How can we help?"
        description="Questions about licensing, activation, or billing? Send us a note and a human will reply, usually within one business day."
      />

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              title: "Email us",
              body: env.SUPPORT_EMAIL,
              href: `mailto:${env.SUPPORT_EMAIL}`,
            },
            {
              icon: BookOpen,
              title: "Read the FAQ",
              body: "Common licensing & setup answers",
              href: "/#faq",
            },
            {
              icon: MessageCircle,
              title: "Source & issues",
              body: "Report bugs on the repository",
              href: siteConfig.repo,
            },
          ].map((item) => (
            <Link key={item.title} href={item.href}>
              <Card className="hover:border-primary/40 flex items-center gap-4 p-5 transition-colors">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-sm">{item.body}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Send a message</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Include your order email so we can find your license quickly.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
