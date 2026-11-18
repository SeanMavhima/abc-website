"use server";

import type { z } from "zod";
import { requireAdmin, runAction, ActionError } from "@/lib/auth";
import {
  articleSchema,
  bioCategorySchema,
  categorySchema,
  ecosystemSchema,
  milestoneSchema,
  natureLabSchema,
  observationAdminSchema,
  partnerSchema,
  programmeSchema,
  projectSchema,
  speciesSchema,
  statisticSchema,
  teamMemberSchema,
} from "@/lib/validation/admin";
import { must, revalidateSite } from "./helpers";

/**
 * Generic CRUD for simple content collections. Only the tables listed here
 * can be touched, each with its own validation schema. Permissions are
 * enforced again by Row Level Security in the database.
 */
const SCHEMAS = {
  programmes: programmeSchema,
  articles: articleSchema,
  article_categories: categorySchema,
  team_members: teamMemberSchema,
  partners: partnerSchema,
  impact_statistics: statisticSchema,
  ecosystems: ecosystemSchema,
  biodiversity_categories: bioCategorySchema,
  species: speciesSchema,
  nature_labs: natureLabSchema,
  citizen_science_projects: projectSchema,
  research_projects: projectSchema,
  milestones: milestoneSchema,
  observations: observationAdminSchema,
} satisfies Record<string, z.ZodTypeAny>;

export type RecordTable = keyof typeof SCHEMAS;

const SORTABLE: RecordTable[] = [
  "programmes", "article_categories", "team_members", "partners", "impact_statistics",
  "ecosystems", "biodiversity_categories", "species", "nature_labs", "citizen_science_projects", "research_projects", "milestones",
];

const FLAGS: Partial<Record<RecordTable, string[]>> = {
  programmes: ["is_published", "is_featured"],
  articles: ["is_featured"],
  team_members: ["is_visible"],
  partners: ["is_visible"],
  impact_statistics: ["is_visible"],
  ecosystems: ["is_published"],
  species: ["is_featured", "status"],
  nature_labs: ["is_published"],
  citizen_science_projects: ["is_published"],
  research_projects: ["is_published"],
  milestones: ["is_visible"],
};

function assertTable(table: string): asserts table is RecordTable {
  if (!(table in SCHEMAS)) throw new ActionError("Unknown content type.");
}

export async function saveRecord(table: RecordTable, input: unknown) {
  return runAction(async () => {
    assertTable(table);
    const { supabase } = await requireAdmin();
    const parsed = SCHEMAS[table].parse(input) as { id?: string } & Record<string, unknown>;
    const { id, ...values } = parsed;
    let savedId = id;
    if (id) {
      must(await supabase.from(table).update(values).eq("id", id).select("id").single());
    } else {
      if (SORTABLE.includes(table) && !values.sort_order) {
        const { data } = await supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
        values.sort_order = ((data?.[0]?.sort_order as number | undefined) ?? 0) + 1;
      }
      const row = must(await supabase.from(table).insert(values).select("id").single());
      savedId = row.id as string;
    }
    revalidateSite();
    return { id: savedId as string };
  }, "Saved");
}

export async function deleteRecord(table: RecordTable, id: string) {
  return runAction(async () => {
    assertTable(table);
    const { supabase } = await requireAdmin();
    must(await supabase.from(table).delete().eq("id", id));
    revalidateSite();
  }, "Deleted");
}

/** Persists a new display order: ids[0] gets sort_order 1, and so on. */
export async function reorderRecords(table: RecordTable, ids: string[]) {
  return runAction(async () => {
    assertTable(table);
    if (!SORTABLE.includes(table)) throw new ActionError("This content cannot be reordered.");
    if (!Array.isArray(ids) || ids.length > 500) throw new ActionError("Invalid order.");
    const { supabase } = await requireAdmin();
    for (const [i, id] of ids.entries()) {
      must(await supabase.from(table).update({ sort_order: i + 1 }).eq("id", id));
    }
    revalidateSite();
  }, "Order saved");
}

/** Toggles a boolean flag such as is_visible or is_published. */
export async function setRecordFlag(table: RecordTable, id: string, field: string, value: boolean) {
  return runAction(async () => {
    assertTable(table);
    if (!FLAGS[table]?.includes(field)) throw new ActionError("This setting cannot be changed here.");
    const { supabase } = await requireAdmin();
    // "status" is a draft/published switch; every other flag is a plain yes/no.
    const stored = field === "status" ? (value ? "published" : "draft") : Boolean(value);
    must(await supabase.from(table).update({ [field]: stored }).eq("id", id));
    revalidateSite();
  }, "Updated");
}

/** Publishes or unpublishes an article. */
export async function setArticleStatus(id: string, status: "draft" | "published") {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const current = must(await supabase.from("articles").select("published_at").eq("id", id).single());
    const update: Record<string, unknown> = { status };
    if (status === "published" && !current.published_at) update.published_at = new Date().toISOString();
    must(await supabase.from("articles").update(update).eq("id", id));
    revalidateSite();
  }, status === "published" ? "Published" : "Moved to drafts");
}
