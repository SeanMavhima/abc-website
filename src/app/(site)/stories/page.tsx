import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { getArticles, getCategories, getPage, getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/site/page-hero";
import { StoryCard } from "@/components/site/cards";
import { Reveal } from "@/components/site/reveal";
import { BlockRenderer } from "@/components/blocks/block-renderer";

type Props = { searchParams: Promise<{ category?: string; q?: string; page?: string }> };

const PAGE_SIZE = 9;

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSiteSettings(), getPage("stories")]);
  return pageMetadata({
    settings,
    title: page?.seo_title || page?.title || "Stories & Insights",
    description: page?.seo_description || page?.description,
    image: page?.hero_image,
    path: "/stories",
  });
}

function buildHref(params: { category?: string; q?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const s = sp.toString();
  return `/stories${s ? `?${s}` : ""}#stories`;
}

export default async function StoriesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category.slice(0, 80) : "";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [settings, cmsPage, categories, { items, total }] = await Promise.all([
    getSiteSettings(),
    getPage("stories"),
    getCategories(),
    getArticles({ category, q, page, pageSize: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCategory = categories.find((c) => c.slug === category);
  const filtering = Boolean(category || q);
  const [lead, ...others] = items;
  const showLead = !filtering && page === 1 && lead;

  return (
    <>
      <PageHero
        eyebrow={cmsPage?.hero_eyebrow || "Stories, research and field notes"}
        title={cmsPage?.title || "Stories & Insights"}
        description={cmsPage?.description}
        image={cmsPage?.hero_image}
        crumbs={[{ label: cmsPage?.title || "Stories & Insights" }]}
      />

      <section id="stories" className="scroll-mt-24 bg-ivory py-16 sm:py-24">
        <div className="container-site">
          {/* Filters */}
          <div className="flex flex-col gap-6 border-b border-forest/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label="Story categories" className="-mx-1 overflow-x-auto pb-1">
              <ul className="flex gap-2 px-1">
                <li>
                  <Link
                    href={buildHref({ q })}
                    aria-current={!category ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition",
                      !category ? "bg-forest text-white" : "bg-white text-charcoal/75 ring-1 ring-forest/10 hover:ring-forest/30",
                    )}
                  >
                    All stories
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={buildHref({ category: c.slug, q })}
                      aria-current={category === c.slug ? "page" : undefined}
                      className={cn(
                        "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition",
                        category === c.slug
                          ? "bg-forest text-white"
                          : "bg-white text-charcoal/75 ring-1 ring-forest/10 hover:ring-forest/30",
                      )}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <form action="/stories" method="get" role="search" className="relative w-full lg:w-80">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <label htmlFor="story-search" className="sr-only">
                Search stories
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-charcoal/40" />
              <input
                id="story-search"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search stories"
                className="h-11 w-full rounded-full border border-forest/12 bg-white pr-4 pl-11 text-sm focus:border-evergreen focus:ring-3 focus:ring-evergreen/15 focus:outline-none"
              />
            </form>
          </div>

          {filtering ? (
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-charcoal/70">
              <span>
                {total} {total === 1 ? "story" : "stories"}
                {activeCategory ? ` in ${activeCategory.name}` : ""}
                {q ? ` matching "${q}"` : ""}
              </span>
              <Link href="/stories#stories" className="inline-flex items-center gap-1 font-semibold text-evergreen hover:underline">
                <X className="size-3.5" /> Clear filters
              </Link>
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="mx-auto mt-16 max-w-md text-center">
              <p className="font-display text-2xl font-medium text-forest">No stories found</p>
              <p className="mt-3 text-charcoal/65">
                {filtering ? "Try a different category or search term." : "Stories will appear here once they are published."}
              </p>
            </div>
          ) : (
            <>
              {showLead ? (
                <Reveal className="mt-12">
                  <StoryCard article={lead} variant="feature" />
                </Reveal>
              ) : null}
              <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {(showLead ? others : items).map((a, i) => (
                  <Reveal as="li" key={a.id} delay={(i % 3) * 0.08}>
                    <StoryCard article={a} />
                  </Reveal>
                ))}
              </ul>
            </>
          )}

          {totalPages > 1 ? (
            <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Link
                  href={buildHref({ category, q, page: page - 1 })}
                  className="inline-flex h-10 items-center gap-1 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-forest/10 hover:ring-forest/30"
                >
                  <ChevronLeft className="size-4" /> Previous
                </Link>
              ) : null}
              <span className="px-3 text-sm text-charcoal/60">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={buildHref({ category, q, page: page + 1 })}
                  className="inline-flex h-10 items-center gap-1 rounded-full bg-white px-4 text-sm font-medium ring-1 ring-forest/10 hover:ring-forest/30"
                >
                  Next <ChevronRight className="size-4" />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </section>

      {cmsPage?.sections.length ? <BlockRenderer blocks={cmsPage.sections} settings={settings} /> : null}
    </>
  );
}
