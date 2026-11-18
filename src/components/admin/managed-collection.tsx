import { DatabaseZap } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import type { FieldOption } from "@/lib/blocks";
import { isSchemaOutOfDate } from "@/lib/actions/admin/helpers";
import { CollectionManager, type CollectionKind } from "./collection-manager";
import { AdminPageHeader } from "./primitives";

/** Shown instead of an error when a page needs a database update that has not been run yet. */
export function MigrationNotice() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 sm:flex-row sm:items-start">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-200/70">
        <DatabaseZap className="size-5" aria-hidden="true" />
      </span>
      <div className="text-sm leading-relaxed">
        <p className="text-base font-semibold">One database update is needed first</p>
        <p className="mt-1">This part of the content manager uses tables that have not been created in your Supabase project yet.</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>
            Open your project in Supabase and go to <strong>SQL Editor</strong>.
          </li>
          <li>
            Paste the contents of <code className="rounded bg-amber-100 px-1 py-0.5">supabase/migrations/20261115000005_explorer_observatory.sql</code> and press <strong>Run</strong>.
          </li>
          <li>
            On your computer, run <code className="rounded bg-amber-100 px-1 py-0.5">npm run seed -- --force</code> to load the new pages, menu and starter content.
            This replaces the original starter content, so skip it if you have already rewritten those pages and add the new content by hand instead.
          </li>
          <li>Reload this page.</li>
        </ol>
        <p className="mt-3">Until then, the public website shows the bundled reference content for these sections.</p>
      </div>
    </div>
  );
}

type OptionSource = { field: string; table: string; label: string };

/**
 * A complete admin page for one content type: heading, guidance, and the
 * list with create, edit, publish, reorder, search and delete.
 */
export async function ManagedCollection({
  kind,
  table,
  title,
  description,
  order = "sort_order",
  ascending = true,
  notice,
  optionSources = [],
}: {
  kind: CollectionKind;
  table: string;
  title: string;
  description: string;
  order?: string;
  ascending?: boolean;
  /** Guidance about accuracy, shown above the list. */
  notice?: React.ReactNode;
  /** Other tables whose rows fill a dropdown, for example the Group of a species. */
  optionSources?: OptionSource[];
}) {
  const { supabase } = await requireAdminPage();
  const [rows, ...sources] = await Promise.all([
    supabase.from(table).select("*").order(order, { ascending }),
    ...optionSources.map((s) => supabase.from(s.table).select(`id, ${s.label}`).order(s.label)),
  ]);

  const header = <AdminPageHeader title={title} description={description} />;
  if (isSchemaOutOfDate(rows.error)) {
    return (
      <>
        {header}
        <MigrationNotice />
      </>
    );
  }
  if (rows.error) throw new Error(rows.error.message);

  const options: Record<string, FieldOption[]> = {};
  optionSources.forEach((s, i) => {
    const data = (sources[i].data ?? []) as unknown as Record<string, string>[];
    options[s.field] = data.map((r) => ({ value: r.id, label: r[s.label] }));
  });

  return (
    <>
      {header}
      {notice ? <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">{notice}</div> : null}
      <CollectionManager kind={kind} items={rows.data ?? []} options={options} />
    </>
  );
}
