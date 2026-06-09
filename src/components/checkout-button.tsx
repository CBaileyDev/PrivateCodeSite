"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

interface CheckoutButtonProps extends ButtonProps {
  /** Optional pre-fill for the hosted checkout. */
  email?: string;
  children?: React.ReactNode;
}

/**
 * Initiates a real purchase: asks our API to create a Lemon Squeezy checkout
 * session, then redirects the browser to the hosted, PCI-compliant checkout.
 * Never touches card data directly.
 */
export function CheckoutButton({
  email,
  children = "Get PrivateCode",
  ...buttonProps
}: CheckoutButtonProps) {
  const [loading, setLoading] = React.useState(false);

  async function startCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email ? { email } : {}),
      });

      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!res.ok || !data.url) {
        toast.error(
          data.error ??
            "We couldn't start checkout right now. Please try again shortly.",
        );
        setLoading(false);
        return;
      }

      // Hand off to the hosted checkout. Deliberately stay in the loading
      // state — re-enabling the button mid-navigation invites double clicks
      // that create duplicate checkout sessions.
      window.location.assign(data.url);
    } catch {
      toast.error("Network error starting checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Button onClick={startCheckout} disabled={loading} {...buttonProps}>
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          Starting checkout…
        </>
      ) : (
        children
      )}
    </Button>
  );
}
