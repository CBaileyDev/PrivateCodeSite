import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-primary font-mono text-sm">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Back home
      </Link>
    </div>
  );
}
