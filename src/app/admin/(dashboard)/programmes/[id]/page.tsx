import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/auth";
import type { Programme } from "@/lib/types";
import { ProgrammeEditor } from "./programme-editor";

export const metadata: Metadata = { title: "Edit programme" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProgramme({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdminPage();
  if (id === "new") {
    return (
      <ProgrammeEditor
        initial={{
          id: "",
          slug: "",
          title: "",
          summary: "",
          description: "",
          icon: "leaf",
          cover_image: null,
          status: "proposed",
          category: "",
          sort_order: 0,
          is_published: false,
          is_featured: false,
          seo_title: "",
          seo_description: "",
        }}
      />
    );
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("programmes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <ProgrammeEditor initial={data as Programme} />;
}
