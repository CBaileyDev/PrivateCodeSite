import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, KeyRound, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/site/page-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { features } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { getOrdersForEmail } from "@/lib/db/queries";
import { siteConfig } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "License portal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function NotConfigured() {
  return (
    <PageShell className="max-w-xl">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          License portal
        </h1>
        <p className="text-muted-foreground mt-3">
          The customer portal isn’t enabled in this environment yet. Your
          license key is always available in your purchase confirmation email.
        </p>
        <Link
          href="/support"
          className={buttonVariants({
            variant: "secondary",
            className: "mt-6",
          })}
        >
          Contact support
        </Link>
      </Card>
    </PageShell>
  );
}

const statusVariant: Record<string, "accent" | "muted" | "default"> = {
  active: "accent",
  paid: "accent",
  refunded: "muted",
  partial_refund: "muted",
  revoked: "muted",
};

export default async function DashboardPage() {
  if (!features.supabase) return <NotConfigured />;

  const user = await getCurrentUser();
  if (!user?.email) redirect("/login");

  const rows = features.database ? await getOrdersForEmail(user.email) : [];

  return (
    <PageShell className="max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your licenses
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {rows.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center p-10 text-center">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl">
            <ShoppingBag className="size-6" />
          </div>
          <h2 className="mt-4 font-semibold">No purchases yet</h2>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            When you buy PrivateCode, your license and downloads will appear
            here.
          </p>
          <Link
            href="/#pricing"
            className={buttonVariants({
              variant: "primary",
              className: "mt-5",
            })}
          >
            Get PrivateCode
          </Link>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {rows.map(({ order, license }) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[order.status] ?? "muted"}>
                    {order.status.replace("_", " ")}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(order.amountCents, order.currency)}
                </span>
              </div>

              {license && (
                <div className="border-border bg-muted mt-4 flex items-center gap-3 rounded-xl border px-4 py-3">
                  <KeyRound className="text-primary size-4 shrink-0" />
                  <code className="font-mono text-sm">
                    {license.displayKey}
                  </code>
                  <span className="text-muted-foreground ml-auto text-xs">
                    Full key is in your email
                  </span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`${siteConfig.repo}/releases/latest`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  <Download />
                  Download
                </Link>
                {order.receiptUrl && (
                  <Link
                    href={order.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    View receipt
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
