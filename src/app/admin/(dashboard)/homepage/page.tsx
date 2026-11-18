import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { rowToBlock } from "@/lib/data/public";
import type { HomepageSectionRow } from "@/lib/types";
import { HomepageEditor } from "./homepage-editor";

export const metadata: Metadata = { title: "Homepage" };

export default async function HomepageAdminPage() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("homepage_sections").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return <HomepageEditor initial={((data ?? []) as HomepageSectionRow[]).map(rowToBlock)} />;
}
