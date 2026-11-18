import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/primitives";
import { CollectionManager } from "@/components/admin/collection-manager";

export const metadata: Metadata = { title: "Team" };

export default async function Page() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("team_members").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (
    <>
      <AdminPageHeader title="Team" description="Team members appear on the About page when visible. Use the arrows to set their order." />

      <CollectionManager kind="team" items={data ?? []} />
    </>
  );
}
