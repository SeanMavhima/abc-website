import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/primitives";
import { CollectionManager } from "@/components/admin/collection-manager";

export const metadata: Metadata = { title: "Impact statistics" };

export default async function Page() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("impact_statistics").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (
    <>
      <AdminPageHeader
        title="Impact statistics"
        description="Animated figures shown in Impact statistics sections. Label targets clearly and replace them with verified results over time."
      />
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Every figure shows its status publicly. Keep proposed figures as <strong>Proposed target</strong>. Use <strong>Achieved</strong> only for
        recorded results and <strong>Verified</strong> only once a result has been checked, and add the date and source. Targets are drawn as outlines
        on the website; results are drawn solid.
      </div>
      <CollectionManager kind="statistics" items={(data ?? []).map((s) => ({ ...s, value: Number(s.value) }))} />
    </>
  );
}
