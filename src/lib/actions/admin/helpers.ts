import "server-only";
import { revalidatePath } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";
import { ActionError } from "@/lib/auth";

/**
 * Throws a friendly ActionError for a Supabase error. Without an error,
 * selects return rows (or [] for lists); writes without .select() return
 * nothing and callers ignore the value.
 */
export function must<T>(res: { data: T; error: PostgrestError | null }): NonNullable<T> {
  if (res.error) {
    const e = res.error;
    if (e.code === "23505") throw new ActionError("That address (slug) or value is already in use. Please choose another.");
    if (e.code === "23503") throw new ActionError("This item is referenced by other content.");
    if (e.code === "42501") throw new ActionError("Permission denied. Your account may not have administrator access.");
    if (isSchemaOutOfDate(e)) throw new ActionError(MIGRATION_MESSAGE);
    throw new ActionError(e.message);
  }
  return res.data as NonNullable<T>;
}

/** Refreshes every statically rendered public page after a content change. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

export const MIGRATION_MESSAGE =
  "The database has not been updated for this feature yet. In the Supabase SQL Editor, run supabase/migrations/20261115000005_explorer_observatory.sql, then try again.";

/** True when a table or column added by a later migration does not exist yet. */
export function isSchemaOutOfDate(e: { code?: string } | null | undefined) {
  return e?.code === "PGRST204" || e?.code === "PGRST205" || e?.code === "42703" || e?.code === "42P01";
}
