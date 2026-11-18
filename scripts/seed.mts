/**
 * Seeds a Supabase project with the initial ABC content.
 *
 *   npm run seed            # refuses if content already exists
 *   npm run seed -- --force # overwrites seeded rows (keeps anything you added)
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnv, requireEnv } from "./lib/env.mts";
import { seedTables } from "./lib/seed-rows.mts";
import { sid } from "../src/content/seed-id.ts";

/** Navigation rows created by earlier versions of the seed that are no longer used. */
const RETIRED_NAV = [
  "h-work-pathway", "h-programmes", "h-prog-learning", "h-prog-science", "h-prog-action", "h-prog-fellows",
  "h-prog-network", "f-prog-learning", "f-prog-science", "f-prog-action", "f-prog-fellows", "f-prog-network",
].map((k) => sid(`nav:${k}`));

loadEnv();
const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const force = process.argv.includes("--force");

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { count, error: countError } = await supabase.from("homepage_sections").select("id", { count: "exact", head: true });
if (countError) {
  console.error("\n  Could not reach the database:", countError.message);
  console.error("  Have you run the SQL migrations in supabase/migrations?\n");
  process.exit(1);
}
if ((count ?? 0) > 0 && !force) {
  console.log("\n  Content already exists. Nothing was changed.");
  console.log("  Run `npm run seed -- --force` to overwrite the seeded rows (your own additions are kept).\n");
  process.exit(0);
}

for (const { table, rows } of seedTables()) {
  if (!rows.length) continue;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
  if (error) {
    console.error(`  ✗ ${table}: ${error.message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${table} (${rows.length})`);
}
console.log("\n  Seed complete. Next: create an administrator with `npm run create-admin`.\n");
