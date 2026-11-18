"use server";

import { z } from "zod";
import { requireAdmin, runAction, ActionError } from "@/lib/auth";
import { navigationItemSchema, settingsSchema } from "@/lib/validation/admin";
import { MIGRATION_MESSAGE, isSchemaOutOfDate, must, revalidateSite } from "./helpers";

export async function saveSettings(input: unknown) {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const values = settingsSchema.parse(input);
    const res = await supabase.from("site_settings").upsert({ id: 1, ...values });
    if (isSchemaOutOfDate(res.error)) {
      // Migration 5 has not been run: save everything except the setting it adds.
      const { observations_open: _skip, ...rest } = values;
      void _skip;
      must(await supabase.from("site_settings").upsert({ id: 1, ...rest }));
      if (values.observations_open) throw new ActionError(MIGRATION_MESSAGE);
    } else {
      must(res);
    }
    revalidateSite();
  }, "Settings saved");
}

/**
 * Saves the complete navigation for one location (header or footer).
 * Items not in the list are deleted; parents are written before children.
 */
export async function saveNavigation(location: "header" | "footer", items: unknown) {
  return runAction(async () => {
    if (location !== "header" && location !== "footer") throw new ActionError("Unknown menu.");
    const { supabase } = await requireAdmin();
    const parsed = z.array(navigationItemSchema).max(200).parse(items);
    const ids = new Set(parsed.map((i) => i.id));
    for (const item of parsed) {
      if (item.parent_id && !ids.has(item.parent_id)) throw new ActionError(`"${item.label}" belongs to a missing parent.`);
      const parent = parsed.find((p) => p.id === item.parent_id);
      if (parent?.parent_id) throw new ActionError("Menus support one level of dropdown links.");
    }

    const existing = must(await supabase.from("navigation_items").select("id").eq("location", location));
    const remove = existing.map((r) => r.id as string).filter((id) => !ids.has(id));
    if (remove.length) must(await supabase.from("navigation_items").delete().in("id", remove));

    const rows = parsed.map((i) => ({ ...i, location }));
    const parents = rows.filter((r) => !r.parent_id);
    const children = rows.filter((r) => r.parent_id);
    if (parents.length) must(await supabase.from("navigation_items").upsert(parents));
    if (children.length) must(await supabase.from("navigation_items").upsert(children));
    revalidateSite();
  }, "Menu saved");
}
