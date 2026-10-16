import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerLoginForm } from "@/components/store/customer-login-form";
import { getSessionUser } from "@/lib/api-auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

/** Only same-site paths, never `//evil.com` (prevents open redirects). */
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/admin") ? next : "/account";
}

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = safeNext(searchParams.next);
  const user = await getSessionUser();
  if (user?.role === "CUSTOMER") redirect(next);

  return (
    <div className="page max-w-lg pt-16">
      <h1 className="display text-5xl">Sign in</h1>
      <p className="mt-4 text-sm text-muted">
        See all your orders in one place. Use the email you checked out with and your past orders will show up
        automatically.
      </p>
      <CustomerLoginForm next={next} />
      <p className="mt-10 text-sm text-muted">
        Just want to check one order?{" "}
        <Link href="/track" className="text-ink underline underline-offset-4">
          Track it without signing in
        </Link>
        .
      </p>
    </div>
  );
}
