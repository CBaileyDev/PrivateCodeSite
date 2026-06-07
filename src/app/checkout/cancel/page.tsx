import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/site/page-shell";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <PageShell className="max-w-xl">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Checkout cancelled
        </h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          No charge was made. Whenever you’re ready, you can pick up right where
          you left off — your cart isn’t going anywhere.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/#pricing"
            className={buttonVariants({ variant: "primary" })}
          >
            Back to pricing
          </Link>
          <Link
            href="/support"
            className={buttonVariants({ variant: "secondary" })}
          >
            Have a question?
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
