"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/deck/Logo";
import { toast } from "@/lib/toast-store";
import { Mail, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.", "Invalid email");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message, "Sign in failed");
      } else {
        setIsSent(true);
        toast.success("Magic link sent! Check your inbox.");
      }
    } catch (err) {
      toast.error((err as Error).message, "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-md bg-surface-raised border-[3px] border-primary rounded-lg shadow-sticker p-6 md:p-8 select-none">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary text-center mb-2">
          Admin Sign In
        </h1>
        <p className="font-body text-sm text-text-muted text-center mb-6">
          Enter your admin email to manage Vibe mode scenes and storage.
        </p>

        {isSent ? (
          <div className="flex flex-col items-center p-5 bg-surface-sunken border-[2.5px] border-primary rounded-md text-center">
            <CheckCircle2 className="w-10 h-10 text-leaf mb-2" strokeWidth={2.5} />
            <h2 className="font-display text-lg font-bold text-primary mb-1">
              Check your inbox
            </h2>
            <p className="font-body text-sm text-primary/90">
              We sent a sign-in link to <span className="font-bold">{email}</span>. Click it to access the scenes manager.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email-input"
                className="block text-sm font-bold font-body text-primary mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@chillguy.local"
                  required
                  className="w-full h-12 pl-11 pr-4 bg-surface-sunken border-[2.5px] border-primary rounded-sm text-base text-primary font-body focus-ring placeholder:text-text-muted/60"
                />
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Send magic link
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}

