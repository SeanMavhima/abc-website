import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth";
import type { MediaAsset } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/primitives";
import { MediaLibrary } from "./media-library";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaPage() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) throw new Error(error.message);
  return (
    <>
      <AdminPageHeader
        title="Media library"
        description="Upload and organise photographs and videos. Images up to 10 MB (JPEG, PNG, WebP, AVIF, GIF, SVG); videos up to 50 MB (MP4, WebM)."
      />
      <MediaLibrary initial={(data ?? []) as MediaAsset[]} />
    </>
  );
}
