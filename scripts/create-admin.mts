/**
 * Creates (or promotes) an administrator account.
 *
 *   npm run create-admin -- --email you@example.org --password "a-strong-password" --name "Your Name"
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * Run it from your own machine; never expose the service-role key publicly.
 */
import { createClient } from "@supabase/supabase-js";
import { arg, loadEnv, requireEnv } from "./lib/env.mts";

loadEnv();
const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

const email = arg("email")?.trim().toLowerCase();
const password = arg("password");
const name = arg("name") ?? "";

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('\n  Usage: npm run create-admin -- --email you@example.org --password "..." --name "Your Name"\n');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let userId: string | undefined;
const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();

if (existing) {
  userId = existing.id as string;
  console.log(`  Found existing account for ${email}; granting administrator access.`);
  if (password) {
    const { error } = await supabase.auth.admin.updateUserById(userId, { password });
    if (error) {
      console.error("  Could not update the password:", error.message);
      process.exit(1);
    }
    console.log("  Password updated.");
  }
} else {
  if (!password || password.length < 12) {
    console.error("\n  Please provide --password with at least 12 characters.\n");
    process.exit(1);
  }
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) {
    console.error("  Could not create the user:", error?.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log(`  Created account for ${email}.`);
}

const { error: profileError } = await supabase
  .from("profiles")
  .upsert({ id: userId, email, full_name: name, role: "admin" }, { onConflict: "id" });
if (profileError) {
  console.error("  Could not set the administrator role:", profileError.message);
  console.error("  Have you run the SQL migrations?");
  process.exit(1);
}
console.log(`\n  ${email} is now an administrator. Sign in at /admin/login\n`);
