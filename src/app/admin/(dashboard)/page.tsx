import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Images, Inbox, Mail, Newspaper, PenLine, Sprout, Users, type LucideIcon } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/misc";
import { AdminPageHeader } from "@/components/admin/primitives";

export const metadata: Metadata = { title: "Overview" };

type Recent = { kind: string; title: string; href: string; updated_at: string; status: string };

export default async function AdminOverview() {
  const { supabase, profile } = await requireAdminPage();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);
  const head = { count: "exact" as const, head: true };

  const [
    publishedPages,
    draftPages,
    totalStories,
    draftStories,
    media,
    volunteersNew,
    volunteersAll,
    contactNew,
    contactAll,
    subscribers,
    programmes,
    pages,
    articles,
    progs,
  ] = await Promise.all([
    count(supabase.from("pages").select("id", head).eq("status", "published")),
    count(supabase.from("pages").select("id", head).eq("status", "draft")),
    count(supabase.from("articles").select("id", head)),
    count(supabase.from("articles").select("id", head).eq("status", "draft")),
    count(supabase.from("media_assets").select("id", head)),
    count(supabase.from("volunteer_applications").select("id", head).eq("status", "new")),
    count(supabase.from("volunteer_applications").select("id", head)),
    count(supabase.from("contact_submissions").select("id", head).eq("status", "new")),
    count(supabase.from("contact_submissions").select("id", head)),
    count(supabase.from("newsletter_subscribers").select("id", head).eq("status", "subscribed")),
    count(supabase.from("programmes").select("id", head).eq("is_published", true)),
    supabase.from("pages").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("articles").select("id, title, status, updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("programmes").select("id, title, is_published, updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);

  const recent: Recent[] = [
    ...(pages.data ?? []).map((p) => ({ kind: "Page", title: p.title, href: `/admin/pages/${p.id}`, updated_at: p.updated_at, status: p.status })),
    ...(articles.data ?? []).map((a) => ({ kind: "Story", title: a.title, href: `/admin/stories/${a.id}`, updated_at: a.updated_at, status: a.status })),
    ...(progs.data ?? []).map((p) => ({
      kind: "Programme",
      title: p.title,
      href: `/admin/programmes/${p.id}`,
      updated_at: p.updated_at,
      status: p.is_published ? "published" : "draft",
    })),
  ]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 8);

  const stats: { label: string; value: number; hint?: string; icon: LucideIcon; href: string }[] = [
    { label: "Published pages", value: publishedPages, hint: `${draftPages} draft`, icon: FileText, href: "/admin/pages" },
    { label: "Total stories", value: totalStories, hint: `${draftStories} draft`, icon: Newspaper, href: "/admin/stories" },
    { label: "Draft stories", value: draftStories, icon: PenLine, href: "/admin/stories?status=draft" },
    { label: "Published programmes", value: programmes, icon: Sprout, href: "/admin/programmes" },
    { label: "Media files", value: media, icon: Images, href: "/admin/media" },
    { label: "Applications", value: volunteersAll, hint: `${volunteersNew} new`, icon: Users, href: "/admin/submissions/volunteer" },
    { label: "Contact enquiries", value: contactAll, hint: `${contactNew} new`, icon: Inbox, href: "/admin/submissions/contact" },
    { label: "Newsletter subscribers", value: subscribers, icon: Mail, href: "/admin/submissions/newsletter" },
  ];

  const greeting = profile.full_name ? `Welcome back, ${profile.full_name.split(" ")[0]}` : "Welcome back";

  return (
    <>
      <AdminPageHeader title={greeting} description="An overview of your website content and the messages you have received." />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="group block rounded-2xl border border-border bg-white p-5 shadow-xs transition hover:border-evergreen/40 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="size-4 text-evergreen" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold tabular-nums">{s.value}</p>
              {s.hint ? <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p> : null}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recently updated</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {recent.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No content yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((r) => (
                  <li key={`${r.kind}-${r.href}`}>
                    <Link href={r.href} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 sm:px-6">
                      <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">{r.kind}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.title}</span>
                      <span
                        className={
                          r.status === "published"
                            ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                            : "rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                        }
                      >
                        {r.status === "published" ? "Published" : "Draft"}
                      </span>
                      <span className="hidden w-36 shrink-0 text-right text-xs text-muted-foreground sm:block">{formatDateTime(r.updated_at)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[
                { href: "/admin/stories/new", label: "Write a story" },
                { href: "/admin/homepage", label: "Edit the homepage" },
                { href: "/admin/media", label: "Upload photographs" },
                { href: "/admin/statistics", label: "Update impact statistics" },
                { href: "/admin/settings", label: "Update contact details" },
              ].map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="group flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm font-medium hover:border-evergreen/40 hover:bg-sage/10">
                    {a.label}
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
