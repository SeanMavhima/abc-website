import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/primitives";
import { CollectionManager } from "@/components/admin/collection-manager";

export const metadata: Metadata = { title: "Organisations" };

export default async function Page() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("partners").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (
    <>
      <AdminPageHeader title="Organisations" description="Prospective collaborators, confirmed partners and supporting organisations." />
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Only mark an organisation as a <strong>confirmed partner</strong> once a relationship has been formally established, and only
        display a logo with the organisation&apos;s permission. Each Organisations section on the website shows one relationship type.
      </div>
      <CollectionManager kind="partners" items={data ?? []} />
    </>
  );
}
