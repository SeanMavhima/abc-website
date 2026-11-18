"use server";

import { requireAdmin, runAction, ActionError } from "@/lib/auth";
import { MEDIA_BUCKET } from "@/lib/env";
import { mediaCreateSchema, mediaUpdateSchema } from "@/lib/validation/admin";
import type { MediaAsset } from "@/lib/types";
import { must, revalidateSite } from "./helpers";

export async function listMedia(opts: { folder?: string; q?: string; kind?: "image" | "video" | "all" } = {}) {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    let q = supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(500);
    if (opts.folder) q = q.eq("folder", opts.folder);
    if (opts.kind === "image") q = q.like("mime_type", "image/%");
    if (opts.kind === "video") q = q.like("mime_type", "video/%");
    if (opts.q) {
      const s = opts.q.replace(/[%_,()*\\:."']/g, " ").trim().slice(0, 60);
      if (s) q = q.or(`file_name.ilike.%${s}%,alt_text.ilike.%${s}%,caption.ilike.%${s}%`);
    }
    return must(await q) as MediaAsset[];
  });
}

/** Records an uploaded file. The file itself is uploaded from the browser directly to Storage. */
export async function createMedia(input: unknown) {
  return runAction(async () => {
    const { supabase, user } = await requireAdmin();
    const values = mediaCreateSchema.parse(input);
    if (!values.storage_path.startsWith("uploads/")) throw new ActionError("Invalid storage path.");
    const row = must(
      await supabase
        .from("media_assets")
        .insert({ ...values, uploaded_by: user.id })
        .select("*")
        .single(),
    );
    return row as MediaAsset;
  }, "Uploaded");
}

export async function updateMedia(input: unknown) {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { id, ...values } = mediaUpdateSchema.parse(input);
    const row = must(await supabase.from("media_assets").update(values).eq("id", id).select("*").single());
    revalidateSite();
    return row as MediaAsset;
  }, "Details saved");
}

export async function getMediaUsage(url: string) {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const rows = must(await supabase.rpc("media_usage", { p_url: url }));
    return (rows ?? []) as { source: string; label: string }[];
  });
}

/**
 * Deletes a media item. Refuses when the file is still used somewhere unless
 * `force` is set. Bundled photos (no storage path) only lose their library
 * record; the file in /public stays.
 */
export async function deleteMedia(id: string, force = false) {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const asset = must(await supabase.from("media_assets").select("*").eq("id", id).single()) as MediaAsset;
    if (!force) {
      const usage = must(await supabase.rpc("media_usage", { p_url: asset.url })) as unknown[];
      if (usage?.length) {
        throw new ActionError(`This file is still used in ${usage.length} place(s). Remove it from that content first.`);
      }
    }
    if (asset.storage_path) {
      const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);
      if (error) throw new ActionError(`Could not delete the file from storage: ${error.message}`);
    }
    must(await supabase.from("media_assets").delete().eq("id", id));
  }, "Deleted");
}
