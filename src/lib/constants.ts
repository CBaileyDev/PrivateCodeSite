import { publicEnv } from "@/lib/env";

/** Single source of truth for product copy, pricing, and links. */

export const siteConfig = {
  name: "PrivateCode",
  shortName: "PrivateCode",
  domain: "privatecode.dev",
  url: publicEnv.NEXT_PUBLIC_APP_URL,
  tagline: "The native, instant, local-first AI coding agent.",
  description:
    "PrivateCode is a native, instant, local-first AI coding agent — terminal and GUI. Sub-100ms startup, under 30MB idle memory, and your keys never leave your machine. Beats the alternatives on startup, memory, code-intelligence speed, and long-session smoothness.",
  repo: "https://github.com/CBaileyDev/PrivateCode",
  twitter: "@privatecode",
} as const;

/** One-time purchase. Amounts in cents. */
export const pricing = {
  /** Display price. */
  amountCents: 8900,
  currency: "USD",
  name: "PrivateCode — Lifetime License",
  blurb: "One license. One machine-fingerprint family. Yours forever.",
  features: [
    "Lifetime license — no subscription",
    "Terminal TUI, desktop GUI & headless daemon",
    "Bring your own model keys (BYOK)",
    "Offline support for Ollama & LM Studio",
    "12 months of updates included",
    "Priority email support",
  ],
} as const;

export const mainNav = [
  { title: "Features", href: "/#features" },
  { title: "Performance", href: "/#performance" },
  { title: "Pricing", href: "/#pricing" },
  { title: "FAQ", href: "/#faq" },
] as const;

export const footerNav = {
  product: [
    { title: "Features", href: "/#features" },
    { title: "Pricing", href: "/#pricing" },
    { title: "Download", href: "/#pricing" },
    { title: "Changelog", href: siteConfig.repo + "/releases" },
  ],
  support: [
    { title: "Support", href: "/support" },
    { title: "FAQ", href: "/#faq" },
    { title: "License Portal", href: "/dashboard" },
    { title: "Repository", href: siteConfig.repo },
  ],
  legal: [
    { title: "Terms of Service", href: "/legal/terms" },
    { title: "Privacy Policy", href: "/legal/privacy" },
    { title: "Refund Policy", href: "/legal/refund" },
  ],
} as const;

export const faqs = [
  {
    q: "Is my code or are my API keys ever sent to your servers?",
    a: "No. PrivateCode is local-first and BYOK (bring your own key). Your keys are stored in your OS keychain and calls go directly from your machine to the model provider you choose. There is no telemetry and no proxied calls — this site only ever sees your purchase, never your code.",
  },
  {
    q: "What does the license cover?",
    a: "A one-time purchase grants a lifetime license for PrivateCode across the terminal TUI, desktop GUI, and headless daemon, plus 12 months of updates. The license is delivered instantly by email and can be re-downloaded any time from your license portal.",
  },
  {
    q: "Which platforms are supported?",
    a: "macOS, Linux, and Windows. The terminal TUI is built in Rust, the desktop GUI uses Tauri 2 + Solid.js, and a headless daemon powers editor integrations.",
  },
  {
    q: "Can I use it fully offline?",
    a: "Yes. Point PrivateCode at a local Ollama or LM Studio instance and it works with no internet connection at all. Cloud providers are equally supported when you want them.",
  },
  {
    q: "What is your refund policy?",
    a: "If PrivateCode isn't for you, email support within 14 days of purchase for a full, no-questions-asked refund. See our Refund Policy for details.",
  },
  {
    q: "How do updates and validation work?",
    a: "Your license key validates locally and against our lightweight validation endpoint. Updates within your update window are delivered through the app. Your key is stored hashed on our side — we never keep it in plaintext.",
  },
] as const;
