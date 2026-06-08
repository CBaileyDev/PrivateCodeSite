import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/checkout-button";
import { pricing } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-20 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="from-primary/10 absolute top-1/2 left-1/2 h-72 w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial opacity-70" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            One price. Yours forever.
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            No subscriptions, no seats, no upsells. Buy once and own it.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <div className="border-primary/30 bg-card shadow-primary/10 relative overflow-hidden rounded-3xl border p-8 shadow-lg">
            <div className="bg-primary/10 absolute top-0 right-0 size-36 rounded-full" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{pricing.name}</h3>
                <Badge variant="accent">
                  <Sparkles className="size-3.5" />
                  Lifetime
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                {pricing.blurb}
              </p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight">
                  {formatCurrency(pricing.amountCents, pricing.currency)}
                </span>
                <span className="text-muted-foreground pb-1.5 text-sm">
                  one-time
                </span>
              </div>

              <CheckoutButton size="lg" className="mt-7 w-full">
                Get PrivateCode
              </CheckoutButton>

              <p className="text-muted-foreground mt-3 text-center text-xs">
                Secure checkout via Lemon Squeezy · Instant license delivery
              </p>

              <ul className="border-border mt-7 space-y-3 border-t pt-7">
                {pricing.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="text-accent mt-0.5 size-4 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
