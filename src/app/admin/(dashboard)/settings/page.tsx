import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import { normaliseSettings } from "@/lib/data/public";
import type { SiteSettings } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/primitives";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Website settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const { created_at: _c, id: _id, ...settings } = normaliseSettings(data as Partial<SiteSettings>) as SiteSettings & {
    created_at?: string;
    id?: number;
  };
  void _c;
  void _id;
  return (
    <>
      <AdminPageHeader title="Website settings" description="Organisation details, branding, search defaults, contact details and footer content." />
      <SettingsForm initial={settings} />
    </>
  );
}
