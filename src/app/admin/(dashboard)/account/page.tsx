import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/primitives";
import { AccountForms } from "./account-forms";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const { profile, user } = await requireAdminPage();
  return (
    <>
      <AdminPageHeader title="My account" description="Your name and password." />
      <AccountForms email={user.email ?? ""} fullName={profile.full_name} lastSignIn={user.last_sign_in_at ?? null} />
    </>
  );
}
