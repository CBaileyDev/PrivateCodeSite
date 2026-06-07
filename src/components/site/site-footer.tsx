import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { footerNav, siteConfig } from "@/lib/constants";

const columns = [
  { title: "Product", links: footerNav.product },
  { title: "Support", links: footerNav.support },
  { title: "Legal", links: footerNav.legal },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-border bg-background-subtle border-t">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="text-muted-foreground mt-4 max-w-xs text-sm">
              {siteConfig.tagline} Your code and keys never leave your machine.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-foreground text-sm font-semibold">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Built local-first. No telemetry, ever.
          </p>
        </div>
      </div>
    </footer>
  );
}
