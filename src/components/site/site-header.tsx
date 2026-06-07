"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { buttonVariants } from "@/components/ui/button";
import { mainNav } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="PrivateCode home" className="z-10">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Portal
          </Link>
          <Link
            href="/#pricing"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            Get PrivateCode
          </Link>
        </div>

        <button
          type="button"
          className="text-foreground z-10 inline-flex size-10 items-center justify-center rounded-lg md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-border bg-background/95 border-t backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-2.5 text-sm"
              >
                {item.title}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "secondary" })}
              >
                License Portal
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "primary" })}
              >
                Get PrivateCode
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
