import {
  Zap,
  ShieldCheck,
  Search,
  GitBranch,
  Boxes,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const featureList: Feature[] = [
  {
    icon: Zap,
    title: "Sub-100ms cold start",
    description:
      "A native Rust core boots in 84ms and stays out of your way. The idle daemon sits under 30MB; the full GUI workspace under 150MB.",
  },
  {
    icon: Search,
    title: "Instant code intelligence",
    description:
      "Tree-sitter parsing and local indexing give you fuzzy search across 200k+ symbols in under 50ms, with structural repository maps.",
  },
  {
    icon: ShieldCheck,
    title: "Local-first & private",
    description:
      "BYOK with direct client-to-model calls. Keys live in your OS keychain. No telemetry, no proxied requests — ever.",
  },
  {
    icon: WifiOff,
    title: "Works fully offline",
    description:
      "First-class support for Ollama and LM Studio. Point PrivateCode at a local model and code on a plane with zero connectivity.",
  },
  {
    icon: GitBranch,
    title: "Git-backed safety",
    description:
      "Automatic snapshots before every change and single-keystroke undo. A sandboxed plugin model keeps the terminal safe.",
  },
  {
    icon: Boxes,
    title: "One agent, every surface",
    description:
      "A stateful daemon shares session history across the terminal TUI, desktop GUI, and editor plugins — switch without losing context.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for speed you can feel
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Every interaction is engineered to be instant, private, and
            keyboard-native — without the bloat of an Electron app.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((feature) => (
            <article
              key={feature.title}
              className="group border-border bg-card hover:border-primary/40 rounded-2xl border p-6 transition-colors"
            >
              <div className="bg-primary/10 text-primary ring-primary/20 flex size-11 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-105">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
