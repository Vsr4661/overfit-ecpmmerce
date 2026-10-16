"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, Field, Input } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "Unable to sign in.");
        return;
      }
      if (data.user?.role !== "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST" });
        setError("This account doesn't have admin access.");
        return;
      }
      const next = searchParams.get("next");
      // Only follow same-site admin paths (prevents open redirects).
      router.push(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className="w-full max-w-sm bg-surface p-8">
        <p className="display text-3xl">Overfit</p>
        <p className="label mt-1">Admin</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
