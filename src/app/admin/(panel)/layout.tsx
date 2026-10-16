import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { getSessionUser } from "@/lib/api-auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already guards /admin; this is defence in depth for server rendering.
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <AdminNav email={user.email} />
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
