"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, runAction, ActionError } from "@/lib/auth";
import { must } from "./helpers";

const TABLES = {
  contact: "contact_submissions",
  volunteer: "volunteer_applications",
  newsletter: "newsletter_subscribers",
} as const;

export type SubmissionKind = keyof typeof TABLES;

function table(kind: SubmissionKind) {
  const t = TABLES[kind];
  if (!t) throw new ActionError("Unknown submission type.");
  return t;
}

export async function setSubmissionStatus(kind: SubmissionKind, id: string, status: string) {
  return runAction(async () => {
    const allowed = kind === "newsletter" ? ["subscribed", "unsubscribed"] : ["new", "reviewed", "resolved"];
    if (!allowed.includes(status)) throw new ActionError("Invalid status.");
    const { supabase } = await requireAdmin();
    must(await supabase.from(table(kind)).update({ status }).eq("id", id));
    revalidatePath("/admin", "layout");
  }, "Status updated");
}

export async function deleteSubmission(kind: SubmissionKind, id: string) {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    must(await supabase.from(table(kind)).delete().eq("id", id));
    revalidatePath("/admin", "layout");
  }, "Deleted");
}
