import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "border-border bg-input text-foreground flex min-h-28 w-full rounded-lg border px-3.5 py-2.5 text-sm shadow-sm transition-colors",
      "placeholder:text-muted-foreground",
      "focus-visible:border-primary/50 focus-visible:ring-ring/40 focus-visible:ring-2 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/30",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
