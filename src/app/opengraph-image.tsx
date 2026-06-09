import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/constants";

/**
 * Open Graph / Twitter card image, generated at build time. The root metadata
 * declares `twitter.card: summary_large_image`, so without this file shared
 * links render with no visual at all.
 */

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#07080d",
        backgroundImage:
          "radial-gradient(640px 360px at 50% 0%, rgba(124,92,255,0.25), transparent 70%), radial-gradient(480px 320px at 85% 100%, rgba(52,211,153,0.12), transparent 70%)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Brand glyph — mirrors src/components/site/logo.tsx */}
        <svg width="96" height="96" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#7C5CFF" />
          <path
            d="M12 11.5 8.5 16 12 20.5M20 11.5 23.5 16 20 20.5M17.5 9.5l-3 13"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            color: "#e7e9f3",
            letterSpacing: "-2px",
          }}
        >
          <span>Private</span>
          <span style={{ color: "#7c5cff" }}>Code</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 36,
          fontSize: 38,
          color: "#e7e9f3",
          textAlign: "center",
          maxWidth: 900,
          lineHeight: 1.3,
        }}
      >
        {siteConfig.tagline}
      </div>

      <div
        style={{
          marginTop: 40,
          display: "flex",
          gap: 16,
          fontSize: 24,
          color: "#9298ad",
        }}
      >
        <span
          style={{
            border: "1px solid #1b1f2e",
            borderRadius: 999,
            padding: "10px 24px",
            backgroundColor: "#0d0f1a",
          }}
        >
          Sub-100ms startup
        </span>
        <span
          style={{
            border: "1px solid #1b1f2e",
            borderRadius: 999,
            padding: "10px 24px",
            backgroundColor: "#0d0f1a",
          }}
        >
          BYOK · No telemetry
        </span>
        <span
          style={{
            border: "1px solid #1b1f2e",
            borderRadius: 999,
            padding: "10px 24px",
            backgroundColor: "#0d0f1a",
            color: "#34d399",
          }}
        >
          Local-first
        </span>
      </div>
    </div>,
    size,
  );
}
