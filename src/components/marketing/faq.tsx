import { ChevronDown } from "lucide-react";
import { faqs } from "@/lib/constants";

export function Faq() {
  return (
    <section id="faq" className="relative scroll-mt-20 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Still curious? Reach out from the{" "}
            <a href="/support" className="text-primary hover:underline">
              support page
            </a>
            .
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <details className="group border-border bg-card rounded-xl border px-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium">
                  {faq.q}
                  <ChevronDown className="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-muted-foreground pb-5 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
