"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { getServerClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured, SITE_URL } from "@/lib/env";
import { requireAdmin, runAction, ActionError } from "@/lib/auth";
import { must } from "./helpers";

const credentials = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export type LoginState = { error?: string } | undefined;

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured) return { error: "Supabase is not configured yet. See the README to connect a database." };
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await getServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: "The email or password is incorrect." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "This account does not have administrator access." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await getServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function requestPasswordReset(email: string) {
  return runAction(async () => {
    if (!isSupabaseConfigured) throw new ActionError("Supabase is not configured.");
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) throw new ActionError("Enter a valid email address.");
    const supabase = await getServerClient();
    const h = await headers();
    const origin = h.get("origin") || SITE_URL;
    await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${origin}/admin/auth/callback?next=/admin/reset-password`,
    });
    // Always report success so the form cannot be used to discover accounts.
  }, "If that address belongs to an administrator, a reset link is on its way.");
}

const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128)
  .refine((p) => /[a-zA-Z]/.test(p) && /\d/.test(p), "Include at least one letter and one number.");

/** Sets a new password for the signed-in user (used after a reset link and from Account). */
export async function updatePassword(password: string) {
  return runAction(async () => {
    const pw = passwordSchema.parse(password);
    const supabase = await getServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new ActionError("Your session has expired. Please request a new reset link.");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) throw new ActionError(error.message);
  }, "Password updated");
}

export async function updateProfile(fullName: string) {
  return runAction(async () => {
    const { supabase, user } = await requireAdmin();
    const name = z.string().trim().max(120).parse(fullName);
    must(await supabase.from("profiles").update({ full_name: name }).eq("id", user.id));
  }, "Profile saved");
}

/* ------------------------------------------------------------------ */
/* Administrator management (requires SUPABASE_SERVICE_ROLE_KEY)       */
/* ------------------------------------------------------------------ */

export async function createAdministrator(input: { email: string; fullName: string; password: string }) {
  return runAction(async () => {
    await requireAdmin();
    const service = getServiceClient();
    if (!service) throw new ActionError("SUPABASE_SERVICE_ROLE_KEY is not set on the server. See the README.");
    const email = z.string().trim().toLowerCase().email("Enter a valid email address.").parse(input.email);
    const fullName = z.string().trim().max(120).parse(input.fullName ?? "");
    const password = passwordSchema.parse(input.password);

    let userId: string | undefined;
    const created = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error) {
      // The account may already exist: promote it instead.
      const { data: existing } = await service.from("profiles").select("id").eq("email", email).maybeSingle();
      if (!existing) throw new ActionError(created.error.message);
      userId = existing.id as string;
    } else {
      userId = created.data.user?.id;
    }
    if (!userId) throw new ActionError("Could not create the account.");
    must(await service.from("profiles").upsert({ id: userId, email, full_name: fullName, role: "admin" }));
  }, "Administrator added. Share the temporary password securely and ask them to change it.");
}

export async function revokeAdministrator(userId: string) {
  return runAction(async () => {
    const { supabase, user } = await requireAdmin();
    if (userId === user.id) throw new ActionError("You cannot remove your own administrator access.");
    const admins = must(await supabase.from("profiles").select("id").eq("role", "admin"));
    if (admins.length <= 1) throw new ActionError("At least one administrator must remain.");
    must(await supabase.from("profiles").update({ role: null }).eq("id", userId));
  }, "Administrator access removed");
}
