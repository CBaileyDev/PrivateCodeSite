import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground mt-4 text-lg">{description}</p>
      )}
    </div>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24", className)}
    >
      {children}
    </div>
  );
}

/** Long-form content styling for legal/marketing prose. */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground mx-auto max-w-3xl space-y-4 text-sm leading-relaxed",
        "[&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold",
        "[&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
        "[&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
