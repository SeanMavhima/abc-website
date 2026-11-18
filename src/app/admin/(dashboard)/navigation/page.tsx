import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import type { NavigationItem } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/primitives";
import { NavigationEditor } from "./navigation-editor";

export const metadata: Metadata = { title: "Navigation & footer" };

export default async function NavigationPage() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("navigation_items").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  const items = (data ?? []) as NavigationItem[];
  return (
    <>
      <AdminPageHeader
        title="Navigation & footer"
        description="Edit the main menu (with dropdowns) and the footer link columns. Footer text, contact details, social links and copyright are in Website settings."
      />
      <NavigationEditor header={items.filter((i) => i.location === "header")} footer={items.filter((i) => i.location === "footer")} />
    </>
  );
}
