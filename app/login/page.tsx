"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/deck/Logo";
import { LockKeyhole } from "lucide-react";
import { z } from "zod";

const loginResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
});

export default function LoginPage() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const updateDigits = (index: number, value: string) => {
    const enteredDigits = value.replace(/\D/g, "");
    if (!enteredDigits) {
      setDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    setDigits((current) => {
      const next = [...current];
      enteredDigits
        .slice(0, 6 - index)
        .split("")
        .forEach((digit, offset) => {
          next[index + offset] = digit;
        });
      return next;
    });
    inputRefs.current[Math.min(index + enteredDigits.length, 5)]?.focus();
    setError("");
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6 - index);

    if (!pastedDigits) return;
    event.preventDefault();
    updateDigits(index, pastedDigits);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (
      event.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
      setDigits((current) => {
        const next = [...current];
        next[index - 1] = "";
        return next;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pin = digits.join("");
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter all six PIN digits.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch {
        setError("The sign-in response could not be read. Try again.");
        return;
      }

      const parsedResponse = loginResponseSchema.safeParse(responseBody);
      if (!response.ok || !parsedResponse.success || !parsedResponse.data.success) {
        setError(
          (parsedResponse.success && parsedResponse.data.error) ||
            "Admin sign-in failed. Check the PIN and try again."
        );
        if (response.status === 401) {
          setDigits(Array(6).fill(""));
          setTimeout(() => inputRefs.current[0]?.focus(), 0);
        }
        return;
      }

      window.location.replace("/scenes");
    } catch {
      setError("Could not reach the sign-in service. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2 md:p-6 bg-surface">
      <div className="w-full max-w-md bg-surface-raised border-[3px] border-primary rounded-lg shadow-sticker p-2 sm:p-5 md:p-8">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary text-center mb-2">
          Admin access
        </h1>
        <p className="font-body text-sm text-text-muted text-center mb-6">
          Enter the six-digit PIN to pick and manage your Vibe scenes.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <fieldset className="w-full border-0 p-0 m-0">
            <legend className="block w-full text-center text-sm font-bold font-body text-primary mb-2">
              Admin PIN
            </legend>
            <div className="flex justify-center gap-0 sm:gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`PIN digit ${index + 1} of 6`}
                  value={digit}
                  onChange={(event) => updateDigits(index, event.target.value)}
                  onPaste={(event) => handlePaste(event, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  disabled={isLoading}
                  className="w-11 h-11 shrink-0 bg-surface-sunken border-[2.5px] border-primary rounded-sm text-center text-xl font-bold font-body text-primary focus-ring disabled:opacity-60"
                />
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="w-full text-center text-sm font-body font-bold text-danger" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={digits.join("").length !== 6}
            className="w-full mt-2"
          >
            <LockKeyhole className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
            {isLoading ? "Checking PIN" : "Open scenes manager"}
          </Button>
        </form>
      </div>
    </main>
  );
}
