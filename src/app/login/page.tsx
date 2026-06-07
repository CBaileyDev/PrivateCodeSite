"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Mail, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createClient, isSupabaseEnabled } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [message, setMessage] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <Card className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          License portal
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Sign in with the email you used at checkout to view your licenses and
          downloads.
        </p>

        {!isSupabaseEnabled ? (
          <div className="border-border bg-muted text-muted-foreground mt-6 rounded-xl border p-4 text-sm">
            The customer portal isn’t enabled in this environment yet. Add your
            Supabase credentials to turn it on — see the README. In the
            meantime, your license key is always available in your purchase
            email.
          </div>
        ) : status === "sent" ? (
          <div className="border-accent/30 bg-accent/10 mt-6 flex items-start gap-3 rounded-xl border p-4">
            <CircleCheck className="text-accent mt-0.5 size-5 shrink-0" />
            <div className="text-sm">
              <p className="text-foreground font-medium">Check your inbox</p>
              <p className="text-muted-foreground mt-1">
                We sent a magic link to <strong>{email}</strong>. Click it to
                sign in.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {status === "error" && (
              <p className="text-destructive text-xs">{message}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Mail />
                  Email me a magic link
                </>
              )}
            </Button>
          </form>
        )}

        <p className="text-muted-foreground mt-6 text-center text-xs">
          <Link href="/support" className="text-primary hover:underline">
            Need help signing in?
          </Link>
        </p>
      </Card>
    </div>
  );
}
