import { isSupabaseConfigured } from "@/lib/env";
import { DismissibleNote } from "./dismissible-note";

/**
 * Shown only when Supabase is not configured, so nobody mistakes the bundled
 * seed content for a live, connected website.
 */
export function DevPreviewBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <DismissibleNote>
      <strong className="font-semibold">Development preview.</strong> Supabase is not connected, so this site is showing the
      bundled seed content. Forms will not send and the admin dashboard is unavailable. See the README to connect a database.
    </DismissibleNote>
  );
}
