import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/store/profile-form";
import { getSessionUser } from "@/lib/api-auth";
import { getCustomerProfile } from "@/lib/customers";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountProfilePage() {
  const user = await getSessionUser();
  const profile = user?.role === "CUSTOMER" ? await getCustomerProfile(user.id) : null;
  if (!profile) redirect("/login?next=/account");

  const { email, ...initial } = profile;
  return <ProfileForm email={email} initial={initial} />;
}
