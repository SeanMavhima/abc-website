import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import type { Page } from "@/lib/types";
import { PageEditor } from "./page-editor";

export const metadata: Metadata = { title: "Edit page" };

type Props = { params: Promise<{ id: string }> };

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdminPage();
  if (id === "new") {
    const blank: Page = {
      id: "",
      slug: "",
      title: "",
      description: "",
      hero_eyebrow: "",
      hero_image: null,
      sections: [],
      status: "draft",
      is_system: false,
      seo_title: "",
      seo_description: "",
    };
    return <PageEditor initial={blank} />;
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const page = data as Page;
  return <PageEditor initial={{ ...page, sections: Array.isArray(page.sections) ? page.sections : [] }} />;
}
