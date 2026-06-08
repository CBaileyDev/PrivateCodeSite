import { cn } from "@/lib/utils";

type Line = { text: React.ReactNode; className?: string };

const lines: Line[] = [
  { text: "$ privatecode", className: "text-foreground" },
  {
    text: "◆ daemon ready in 84ms · 27MB resident · model: ollama/llama3.1",
    className: "text-muted-foreground",
  },
  { text: "", className: "" },
  {
    text: "› refactor the auth middleware to use the new token service",
    className: "text-accent",
  },
  {
    text: "  ⟢ indexed 214,803 symbols in 41ms",
    className: "text-muted-foreground",
  },
  {
    text: "  ⟢ found 3 call sites · src/auth/*.ts",
    className: "text-muted-foreground",
  },
  {
    text: "  ✎ editing middleware.ts, session.ts, token-service.ts",
    className: "text-primary",
  },
  {
    text: "  ⟲ git snapshot saved · press u to undo",
    className: "text-muted-foreground",
  },
  { text: "  ✔ done — 0 calls left your machine", className: "text-accent" },
];

export function TerminalDemo() {
  return (
    <div className="border-border bg-card shadow-primary/5 mx-auto max-w-3xl overflow-hidden rounded-2xl border shadow-lg">
      <div className="border-border bg-background-subtle flex items-center gap-2 border-b px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="text-muted-foreground ml-3 font-mono text-xs">
          privatecode — tui
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed sm:text-sm">
        <code className="block">
          {lines.map((line, i) => (
            <span key={i} className={cn("block", line.className)}>
              {line.text === "" ? " " : line.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
