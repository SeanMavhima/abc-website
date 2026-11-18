import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { Profile } from "@/lib/types";

export type AdminSession = {
  user: User;
  profile: Profile;
  supabase: Awaited<ReturnType<typeof getServerClient>>;
};

/**
 * Returns the signed-in administrator, or null. Uses getUser(), which
 * verifies the session with Supabase Auth instead of trusting the cookie.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile || profile.role !== "admin") return null;
  return { user, profile: profile as Profile, supabase };
});

/** For admin pages and layouts: redirects to the login page when not an administrator. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?error=unauthorised");
  return session;
}

export class ActionError extends Error {}

/** For server actions: throws when the caller is not an administrator. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new ActionError("You must be signed in as an administrator to do this.");
  return session;
}

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

/** Wraps a server action body with consistent error handling. */
export async function runAction<T>(fn: () => Promise<T>, successMessage?: string): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data, message: successMessage };
  } catch (e) {
    if (e instanceof ActionError) return { ok: false, error: e.message };
    if (e && typeof e === "object" && "issues" in e) {
      const issues = (e as { issues: { path: (string | number)[]; message: string }[] }).issues;
      const first = issues[0];
      return { ok: false, error: first ? `${first.path.join(".") || "Form"}: ${first.message}` : "Please check the form." };
    }
    console.error("[admin action]", e);
    const msg = e instanceof Error ? e.message : "Something went wrong.";
    return { ok: false, error: msg };
  }
}
