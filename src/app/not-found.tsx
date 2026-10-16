import Link from "next/link";
import { buttonClasses } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <p className="display text-8xl text-accent">404</p>
      <p className="text-sm text-muted">Page not found.</p>
      <Link href="/" className={buttonClasses("primary")}>
        Go home
      </Link>
    </div>
  );
}
