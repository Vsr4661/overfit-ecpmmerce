import { redirect } from "next/navigation";
import { AccountNav } from "@/components/store/account-nav";
import { getSessionUser } from "@/lib/api-auth";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user?.role === "ADMIN") redirect("/admin");
  if (!user) redirect("/login?next=/account");

  return (
    <div className="page pt-12">
      <p className="label">Signed in as {user.email}</p>
      <h1 className="display mt-2 text-5xl">Your account</h1>
      <div className="mt-10 grid gap-10 md:grid-cols-[180px_1fr]">
        <aside>
          <AccountNav />
        </aside>
        <div className="min-w-0 max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
