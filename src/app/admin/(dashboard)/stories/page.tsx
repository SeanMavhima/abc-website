import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Plus, Search } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import type { Article, ArticleCategory } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { AdminPageHeader, EmptyState } from "@/components/admin/primitives";
import { StoryRowActions } from "./row-actions";

export const metadata: Metadata = { title: "Stories" };

type Props = { searchParams: Promise<{ status?: string; category?: string; q?: string }> };

export default async function StoriesAdmin({ searchParams }: Props) {
  const sp = await searchParams;
  const { supabase } = await requireAdminPage();
  let q = supabase.from("articles").select("*").order("updated_at", { ascending: false }).limit(200);
  if (sp.status === "draft" || sp.status === "published") q = q.eq("status", sp.status);
  if (sp.category && /^[0-9a-f-]{36}$/i.test(sp.category)) q = q.eq("category_id", sp.category);
  const search = (sp.q ?? "").replace(/[%_,()*\\:."']/g, " ").trim().slice(0, 60);
  if (search) q = q.ilike("title", `%${search}%`);
  const [{ data, error }, { data: cats }] = await Promise.all([q, supabase.from("article_categories").select("*").order("sort_order")]);
  if (error) throw new Error(error.message);
  const articles = (data ?? []) as Article[];
  const categories = (cats ?? []) as ArticleCategory[];
  const now = Date.now();

  return (
    <>
      <AdminPageHeader
        title="Stories"
        description="Articles, research updates, field notes, photo stories, videos and announcements."
        actions={
          <Button asChild>
            <Link href="/admin/stories/new">
              <Plus /> New story
            </Link>
          </Button>
        }
      />
      <form className="mb-5 flex flex-col gap-2 sm:flex-row" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Search titles"
            aria-label="Search titles"
            className="h-10 w-full rounded-lg border border-input bg-white pr-3 pl-9 text-sm focus:border-evergreen focus:outline-none"
          />
        </div>
        <select name="status" defaultValue={sp.status ?? ""} aria-label="Filter by status" className="h-10 rounded-lg border border-input bg-white px-3 text-sm">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <select name="category" defaultValue={sp.category ?? ""} aria-label="Filter by category" className="h-10 rounded-lg border border-input bg-white px-3 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" className="h-10 rounded-lg">
          Filter
        </Button>
      </form>

      {articles.length === 0 ? (
        <EmptyState icon={<Newspaper />} title="No stories found" description="Write your first story or adjust the filters." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <ul className="divide-y divide-border">
            {articles.map((a) => {
              const scheduled = a.status === "published" && a.published_at && new Date(a.published_at).getTime() > now;
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-4 px-4 py-3 sm:flex-nowrap">
                  {a.featured_image?.src ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                    <img src={a.featured_image.src} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-16 shrink-0 rounded-lg bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/stories/${a.id}`} className="line-clamp-1 font-medium hover:text-evergreen">
                      {a.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={scheduled ? "info" : a.status === "published" ? "success" : "warning"}>
                        {scheduled ? "Scheduled" : a.status === "published" ? "Published" : "Draft"}
                      </Badge>
                      <span>{categories.find((c) => c.id === a.category_id)?.name ?? "Uncategorised"}</span>
                      {a.published_at ? <span>{formatDate(a.published_at)}</span> : null}
                    </div>
                  </div>
                  <StoryRowActions id={a.id} slug={a.slug} status={a.status} featured={a.is_featured} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
