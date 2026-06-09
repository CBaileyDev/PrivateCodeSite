import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleCheck,
  Download,
  KeyRound,
  Mail,
  MessageCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/site/page-shell";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Purchase complete",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  // Only echo provider-shaped order ids — anything else in the query string
  // is attacker-controlled text we should not render on a trusted page.
  const orderRef =
    typeof params.order_id === "string" &&
    /^[A-Za-z0-9_-]{1,64}$/.test(params.order_id)
      ? params.order_id
      : undefined;

  return (
    <PageShell className="max-w-2xl">
      <div className="flex flex-col items-center text-center">
        <div className="bg-accent/10 text-accent ring-accent/20 flex size-14 items-center justify-center rounded-2xl ring-1">
          <CircleCheck className="size-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          You’re all set 🎉
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          Thanks for buying {siteConfig.name}. Your lifetime license is on its
          way to your inbox right now.
        </p>
        {orderRef && (
          <p className="text-muted-foreground mt-2 font-mono text-xs">
            Order ref: {orderRef}
          </p>
        )}
      </div>

      <div className="mt-10 space-y-3">
        {[
          {
            icon: Mail,
            title: "Check your email",
            body: "Your license key was sent to the address you used at checkout. It can take a minute to arrive — check spam if you don’t see it.",
          },
          {
            icon: Download,
            title: "Download the app",
            body: "Grab the latest build for macOS, Linux, or Windows from our releases page.",
          },
          {
            icon: KeyRound,
            title: "Activate",
            body: "Paste your key into PrivateCode to unlock your lifetime license across the TUI, GUI, and daemon.",
          },
        ].map((step) => (
          <div
            key={step.title}
            className="border-border bg-card flex gap-4 rounded-2xl border p-5"
          >
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <step.icon className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`${siteConfig.repo}/releases/latest`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "primary" })}
        >
          <Download />
          Download PrivateCode
        </Link>
        <Link
          href="/support"
          className={buttonVariants({ variant: "secondary" })}
        >
          <MessageCircle />
          Contact support
        </Link>
      </div>

      <p className="text-muted-foreground mt-6 text-center text-xs">
        Didn’t get your key?{" "}
        <Link href="/support" className="text-primary hover:underline">
          Contact support
        </Link>{" "}
        and we’ll sort it out.
      </p>
    </PageShell>
  );
}
