import type { Metadata } from "next";
import { History } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { isSchemaOutOfDate } from "@/lib/actions/admin/helpers";
import type { AuditEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/misc";
import { MigrationNotice } from "@/components/admin/managed-collection";
import { AdminPageHeader, EmptyState } from "@/components/admin/primitives";

export const metadata: Metadata = { title: "Activity history" };

const TABLE_LABEL: Record<string, string> = {
  site_settings: "Website settings",
  homepage_sections: "Homepage section",
  pages: "Page",
  programmes: "Programme",
  article_categories: "Story category",
  articles: "Story",
  team_members: "Team member",
  partners: "Organisation",
  impact_statistics: "Impact statistic",
  media_assets: "Media",
  navigation_items: "Menu link",
  ecosystems: "Atlas habitat",
  biodiversity_categories: "Species group",
  species: "Species",
  nature_labs: "Nature Lab",
  citizen_science_projects: "Citizen science project",
  research_projects: "Research project",
  milestones: "Milestone",
  observations: "Observation",
};

const ACTION: Record<AuditEntry["action"], { label: string; variant: "success" | "info" | "muted" }> = {
  insert: { label: "Created", variant: "success" },
  update: { label: "Changed", variant: "info" },
  delete: { label: "Deleted", variant: "muted" },
};

export default async function ActivityPage() {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200);
  const header = (
    <AdminPageHeader
      title="Activity history"
      description="The most recent 200 changes to website content: what changed, who changed it and when. Entries are recorded automatically by the database and cannot be edited."
    />
  );
  if (isSchemaOutOfDate(error)) {
    return (
      <>
        {header}
        <MigrationNotice />
      </>
    );
  }
  if (error) throw new Error(error.message);
  const entries = (data ?? []) as AuditEntry[];

  return (
    <>
      {header}
      {entries.length === 0 ? (
        <EmptyState icon={<History />} title="No activity yet" description="Changes made in the content manager will be listed here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">When</th>
                <th scope="col" className="px-4 py-3 font-medium">Action</th>
                <th scope="col" className="px-4 py-3 font-medium">Content</th>
                <th scope="col" className="px-4 py-3 font-medium">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums">{formatDateTime(e.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ACTION[e.action]?.variant ?? "muted"}>{ACTION[e.action]?.label ?? e.action}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground">{TABLE_LABEL[e.table_name] ?? e.table_name}</span>
                    {e.label ? <span className="font-medium text-charcoal"> · {e.label}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.actor_email || "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
