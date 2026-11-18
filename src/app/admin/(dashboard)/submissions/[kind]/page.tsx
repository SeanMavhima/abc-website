import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Inbox, Search } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, EmptyState } from "@/components/admin/primitives";
import { SubmissionList } from "./submission-list";

const KINDS = {
  contact: {
    table: "contact_submissions",
    title: "Contact enquiries",
    description: "Messages sent through the contact form.",
    statuses: ["new", "reviewed", "resolved"],
    search: ["name", "email", "subject", "message"],
  },
  volunteer: {
    table: "volunteer_applications",
    title: "Applications",
    description: "Volunteer, youth researcher, partnership and collaboration expressions of interest.",
    statuses: ["new", "reviewed", "resolved"],
    search: ["name", "email", "organisation", "message"],
  },
  newsletter: {
    table: "newsletter_subscribers",
    title: "Newsletter subscribers",
    description: "Email addresses signed up through the footer. Mark people as unsubscribed when they ask to be removed.",
    statuses: ["subscribed", "unsubscribed"],
    search: ["email"],
  },
} as const;

type Kind = keyof typeof KINDS;
type Props = { params: Promise<{ kind: string }>; searchParams: Promise<{ status?: string; q?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind } = await params;
  return { title: KINDS[kind as Kind]?.title ?? "Submissions" };
}

export default async function SubmissionsPage({ params, searchParams }: Props) {
  const { kind } = await params;
  if (!(kind in KINDS)) notFound();
  const k = kind as Kind;
  const cfg = KINDS[k];
  const sp = await searchParams;
  const { supabase } = await requireAdminPage();

  let q = supabase.from(cfg.table).select("*").order("created_at", { ascending: false }).limit(500);
  const status = (cfg.statuses as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;
  if (status) q = q.eq("status", status);
  const search = (sp.q ?? "").replace(/[%_,()*\\:."']/g, " ").trim().slice(0, 60);
  if (search) q = q.or(cfg.search.map((c) => `${c}.ilike.%${search}%`).join(","));
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const exportHref = `/admin/export/${k}${status ? `?status=${status}` : ""}`;

  return (
    <>
      <AdminPageHeader
        title={cfg.title}
        description={cfg.description}
        actions={
          <Button asChild variant="outline">
            <a href={exportHref}>
              <Download /> Export CSV
            </a>
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {[undefined, ...cfg.statuses].map((s) => (
            <Link
              key={s ?? "all"}
              href={`/admin/submissions/${k}${s ? `?status=${s}` : ""}`}
              aria-current={status === s ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition",
                status === s ? "bg-forest text-white" : "bg-white text-muted-foreground ring-1 ring-border hover:text-charcoal",
              )}
            >
              {s ?? "All"}
            </Link>
          ))}
        </nav>
        <form method="get" className="relative sm:w-72">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Search"
            aria-label="Search submissions"
            className="h-10 w-full rounded-lg border border-input bg-white pr-3 pl-9 text-sm focus:border-evergreen focus:outline-none"
          />
        </form>
      </div>
      {!data?.length ? (
        <EmptyState icon={<Inbox />} title="Nothing here yet" description={search || status ? "No submissions match these filters." : "New submissions will appear here."} />
      ) : (
        <SubmissionList kind={k} items={data} statuses={[...cfg.statuses]} />
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        Submissions contain personal information. Keep exports secure and delete records once they are no longer needed.
      </p>
    </>
  );
}
