import Link from "next/link";
import { ArrowRight, Code2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { TerminalDemo } from "@/components/marketing/terminal-demo";
import { siteConfig } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Aurora + grid backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0" />
        <div className="bg-primary/20 animate-pulse-glow absolute top-[-10%] left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full blur-[140px]" />
        <div className="bg-accent/10 absolute top-[20%] right-[8%] h-[280px] w-[280px] rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-20 pb-20 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Badge variant="accent" className="mb-6">
              <ShieldCheck className="size-3.5" />
              Local-first · BYOK · No telemetry
            </Badge>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
              The native, instant,{" "}
              <span className="from-primary to-accent bg-gradient-to-r bg-clip-text text-transparent">
                local-first
              </span>{" "}
              AI coding agent
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty">
              Terminal and GUI. Sub-100ms cold start, under 30MB idle memory,
              and code intelligence across 200k+ symbols in milliseconds — all
              while your code and keys never leave your machine.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/#pricing"
                className={buttonVariants({ variant: "primary", size: "lg" })}
              >
                Get PrivateCode
                <ArrowRight />
              </Link>
              <Link
                href={siteConfig.repo}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                <Code2 />
                View source
              </Link>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <p className="text-muted-foreground mt-5 text-xs">
              One-time purchase · Lifetime license · 14-day refund guarantee
            </p>
          </Reveal>
        </div>

        <Reveal delay={120} className="mt-16">
          <TerminalDemo />
        </Reveal>
      </div>
    </section>
  );
}
