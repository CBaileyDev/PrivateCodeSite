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
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 md:grid-cols-[1.4fr_repeat(3,auto)] md:items-start md:gap-10">
          <div className="col-span-3 md:col-span-1">
            <Logo />
            <p className="text-muted-foreground mt-3 max-w-xs text-xs">
              {siteConfig.tagline} Your code and keys never leave your machine.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-foreground text-xs font-semibold">
                {col.title}
              </h4>
              <ul className="mt-2 space-y-1.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t pt-4">
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
