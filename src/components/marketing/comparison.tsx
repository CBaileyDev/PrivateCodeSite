import { Check, Minus } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type Row = {
  feature: string;
  privatecode: string | boolean;
  others: string | boolean;
};

const rows: Row[] = [
  { feature: "Cold start", privatecode: "84ms", others: "1–3s" },
  { feature: "Idle memory", privatecode: "<30MB", others: "300MB+" },
  { feature: "Native terminal TUI", privatecode: true, others: false },
  { feature: "Native desktop GUI", privatecode: true, others: "Electron" },
  {
    feature: "Local models (Ollama/LM Studio)",
    privatecode: true,
    others: false,
  },
  { feature: "Keys in OS keychain", privatecode: true, others: false },
  { feature: "Telemetry", privatecode: "None", others: "Usually on" },
  {
    feature: "Shared session across surfaces",
    privatecode: true,
    others: false,
  },
  { feature: "Git snapshots + 1-key undo", privatecode: true, others: false },
];

function Cell({
  value,
  strong,
}: {
  value: string | boolean;
  strong?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check
        className={cn(
          "mx-auto size-5",
          strong ? "text-accent" : "text-foreground",
        )}
      />
    ) : (
      <Minus className="text-muted-foreground mx-auto size-5" />
    );
  }
  return (
    <span
      className={cn(
        "text-sm",
        strong ? "text-foreground font-medium" : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

export function Comparison() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How PrivateCode compares
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            The performance and privacy of a native tool, without the tradeoffs
            of a heavyweight GUI.
          </p>
        </Reveal>

        <Reveal className="border-border mt-12 overflow-hidden rounded-2xl border">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-border bg-background-subtle border-b">
                <th className="text-muted-foreground px-5 py-4 text-sm font-medium">
                  Feature
                </th>
                <th className="text-primary px-5 py-4 text-center text-sm font-semibold">
                  PrivateCode
                </th>
                <th className="text-muted-foreground px-5 py-4 text-center text-sm font-medium">
                  Typical agents
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.feature}
                  className={cn(
                    "border-border border-b last:border-0",
                    i % 2 === 1 && "bg-background-subtle/40",
                  )}
                >
                  <td className="text-foreground px-5 py-3.5 text-sm">
                    {row.feature}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Cell value={row.privatecode} strong />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Cell value={row.others} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
