import { Reveal } from "@/components/ui/reveal";

const stats = [
  { value: "84ms", label: "Cold start", sublabel: "native Rust core" },
  { value: "27MB", label: "Idle memory", sublabel: "daemon resident" },
  { value: "<50ms", label: "Symbol search", sublabel: "across 200k+ symbols" },
  { value: "60fps", label: "Streaming render", sublabel: "virtualized output" },
];

export function Performance() {
  return (
    <section id="performance" className="relative scroll-mt-20 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="border-border from-card to-background-subtle overflow-hidden rounded-3xl border bg-gradient-to-b">
          <div className="divide-border grid grid-cols-2 md:grid-cols-4 md:divide-x">
            {stats.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 80}
                className="flex flex-col items-center gap-1 px-6 py-10 text-center"
              >
                <span className="from-primary to-accent bg-gradient-to-r bg-clip-text font-mono text-4xl font-semibold text-transparent sm:text-5xl">
                  {stat.value}
                </span>
                <span className="text-foreground mt-2 text-sm font-medium">
                  {stat.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {stat.sublabel}
                </span>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
