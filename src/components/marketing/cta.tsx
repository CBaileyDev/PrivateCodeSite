import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="border-border from-primary-muted via-card to-background-subtle relative overflow-hidden rounded-3xl border bg-gradient-to-br px-8 py-16 text-center">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Stop waiting on your tools
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-lg">
              Install in seconds, bring your own model, and keep every byte of
              your code on your machine.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/#pricing"
                className={buttonVariants({ variant: "primary", size: "lg" })}
              >
                Get PrivateCode
                <ArrowRight />
              </Link>
              <Link
                href="/support"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
