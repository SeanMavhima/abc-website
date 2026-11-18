import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/primitives";
import { CollectionManager } from "@/components/admin/collection-manager";

export const metadata: Metadata = { title: "Story categories" };

export default async function Page() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("article_categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (
    <>
      <AdminPageHeader
        title="Story categories"
        description="Categories organise stories and power the filters on the Stories & Insights page. Deleting a category leaves its stories uncategorised."
      />
      <CollectionManager kind="categories" items={data ?? []} />
    </>
  );
}
