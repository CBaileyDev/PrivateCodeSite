import { cn } from "@/lib/utils";

/** PrivateCode wordmark + glyph. The glyph is an inline SVG so it inherits
 *  currentColor and needs no network round-trip. */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="8" fill="url(#pc-grad)" />
        <path
          d="M12 11.5 8.5 16 12 20.5M20 11.5 23.5 16 20 20.5M17.5 9.5l-3 13"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id="pc-grad"
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7C5CFF" />
            <stop offset="1" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>
      {showWordmark && (
        <span className="text-foreground text-base font-semibold tracking-tight">
          Private<span className="text-primary">Code</span>
        </span>
      )}
    </span>
  );
}
