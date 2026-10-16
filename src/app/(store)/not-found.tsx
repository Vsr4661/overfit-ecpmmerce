import Link from "next/link";
import { buttonClasses } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="page flex min-h-[60vh] flex-col items-center justify-center gap-6 pt-10 text-center">
      <p className="display text-[clamp(6rem,20vw,12rem)] text-accent">404</p>
      <h1 className="display text-3xl">This page doesn&apos;t fit</h1>
      <p className="text-sm text-muted">It may have sold out or moved.</p>
      <Link href="/shop" className={buttonClasses("primary", "lg")}>
        Back to the shop
      </Link>
    </div>
  );
}
