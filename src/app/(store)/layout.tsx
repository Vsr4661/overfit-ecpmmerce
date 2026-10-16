import { getCategoriesWithCovers } from "@/lib/catalog";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

// Catalog changes (admin edits, Printrove sync) should show immediately; SQLite reads are cheap.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = (await getCategoriesWithCovers()).map(({ name, slug }) => ({ name, slug }));
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader categories={categories} />
      <main id="main">{children}</main>
      <SiteFooter categories={categories} />
      <WhatsAppButton />
    </>
  );
}
