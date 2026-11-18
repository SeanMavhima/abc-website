"use server";

import { requireAdmin, runAction, ActionError } from "@/lib/auth";
import { pageSchema, sanitizeBlocks } from "@/lib/validation/admin";
import { must, revalidateSite } from "./helpers";

/** Replaces the homepage sections with the given ordered list of blocks. */
export async function saveHomepage(blocks: unknown) {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const clean = sanitizeBlocks(blocks);
    const existing = must(await supabase.from("homepage_sections").select("id"));
    const keep = new Set(clean.map((b) => b.id));
    const remove = existing.map((r) => r.id as string).filter((id) => !keep.has(id));
    if (remove.length) must(await supabase.from("homepage_sections").delete().in("id", remove));
    if (clean.length) {
      must(
        await supabase.from("homepage_sections").upsert(
          clean.map((b, i) => ({ id: b.id, type: b.type, content: b.data, is_visible: b.visible, sort_order: i + 1 })),
        ),
      );
    }
    revalidateSite();
  }, "Homepage saved");
}

export async function savePage(input: unknown) {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { id, ...values } = pageSchema.parse(input);
    if (id) {
      const current = must(await supabase.from("pages").select("slug, is_system").eq("id", id).single());
      // System pages keep their address so dedicated routes and links keep working.
      if (current.is_system && current.slug !== values.slug) {
        throw new ActionError("The address of a core page cannot be changed.");
      }
      must(await supabase.from("pages").update(values).eq("id", id));
      revalidateSite();
      return { id };
    }
    const row = must(await supabase.from("pages").insert({ ...values, is_system: false }).select("id").single());
    revalidateSite();
    return { id: row.id as string };
  }, "Page saved");
}

export async function deletePage(id: string) {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const page = must(await supabase.from("pages").select("is_system").eq("id", id).single());
    if (page.is_system) throw new ActionError("Core pages cannot be deleted. You can unpublish them instead.");
    must(await supabase.from("pages").delete().eq("id", id));
    revalidateSite();
  }, "Page deleted");
}

export async function setPageStatus(id: string, status: "draft" | "published") {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    must(await supabase.from("pages").update({ status }).eq("id", id));
    revalidateSite();
  }, status === "published" ? "Page published" : "Page unpublished");
}

/** Validates block content without saving (used by tests and previews). */
export async function validateBlocks(blocks: unknown) {
  return runAction(async () => {
    await requireAdmin();
    return sanitizeBlocks(blocks).length;
  });
}
