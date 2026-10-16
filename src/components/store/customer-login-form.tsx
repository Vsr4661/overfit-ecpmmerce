"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";

async function post(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, message: (data.message as string | undefined) ?? "Something went wrong. Try again." };
}

/** Two steps: enter email → enter the 6-digit code we email. No passwords for customers. */
export function CustomerLoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const sendCode = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const result = await post("/api/auth/code/request", { email });
      if (!result.ok) return setError(result.message);
      setStep("code");
      setCode("");
      setNotice(`We sent a 6-digit code to ${email.trim()}. It works for 10 minutes.`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await post("/api/auth/code/verify", { email, code });
      if (!result.ok) return setError(result.message);
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void (step === "email" ? sendCode() : verify());
  };

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-5">
      {step === "email" ? (
        <Field label="Email" htmlFor="email" hint="We'll email you a code. No password needed.">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
      ) : (
        <Field label="Sign-in code" htmlFor="code">
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="text-lg tracking-[0.4em]"
          />
        </Field>
      )}

      {notice && !error && <p className="text-sm text-muted">{notice}</p>}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {step === "email" ? (loading ? "Sending code…" : "Email me a code") : loading ? "Signing in…" : "Sign in"}
      </Button>

      {step === "code" && (
        <div className="flex justify-between text-sm">
          <button type="button" className="text-muted underline-offset-4 hover:underline" onClick={() => setStep("email")}>
            Use a different email
          </button>
          <button
            type="button"
            className="text-muted underline-offset-4 hover:underline disabled:opacity-50"
            disabled={loading}
            onClick={() => void sendCode()}
          >
            Resend code
          </button>
        </div>
      )}
    </form>
  );
}
