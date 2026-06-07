"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surfaced to the server logs / error tracker (see lib/logger).
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-xl">
        <AlertTriangle className="size-6" />
      </div>
      <h1 className="mt-5 text-xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        An unexpected error occurred. You can try again — if it keeps happening,
        please contact support.
      </p>
      {error.digest && (
        <p className="text-muted-foreground mt-2 font-mono text-xs">
          Ref: {error.digest}
        </p>
      )}
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
