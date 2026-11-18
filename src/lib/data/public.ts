import "server-only";
import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import {
  seedArticles,
  seedCategories,
  seedHomepage,
  seedMedia,
  seedNavigation,
  seedPages,
  seedPartners,
  seedProgrammes,
  seedSettings,
  seedStatistics,
} from "@/content/seed";
import {
  seedBioCategories,
  seedCitizenScience,
  seedEcosystems,
  seedMilestones,
  seedNatureLabs,
  seedResearchProjects,
  seedSpecies,
} from "@/content/seed-nature";
import type {
  Article,
  ArticleCategory,
  BiodiversityCategory,
  Block,
  Ecosystem,
  Milestone,
  NatureLab,
  Project,
  ProjectKind,
  PublicObservation,
  Species,
  HomepageSectionRow,
  ImpactStatistic,
  MediaAsset,
  NavLocation,
  NavTreeItem,
  NavigationItem,
  Page,
  Partner,
  PartnerRelationship,
  Programme,
  SiteSettings,
  StatisticStatus,
  TeamMember,
} from "@/lib/types";

function logError(scope: string, error: unknown) {
  if (error) console.error(`[data:${scope}]`, error);
}

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

/* ------------------------------------------------------------------ */
/* Settings & navigation                                               */
/* ------------------------------------------------------------------ */

export function normaliseSettings(row: Partial<SiteSettings> | null | undefined): SiteSettings {
  const merged = { ...seedSettings, ...(row ?? {}) } as SiteSettings;
  merged.brand_colors = { ...seedSettings.brand_colors, ...(row?.brand_colors ?? {}) };
  merged.social_links = Array.isArray(merged.social_links) ? merged.social_links : [];
  merged.observations_open = merged.observations_open === true;
  return merged;
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const sb = getPublicClient();
  if (!sb) return seedSettings;
  const { data, error } = await sb.from("site_settings").select("*").eq("id", 1).maybeSingle();
  logError("settings", error);
  return normaliseSettings(data);
});

export function buildNavTree(items: NavigationItem[]): NavTreeItem[] {
  const visible = items.filter((i) => i.is_visible);
  return visible
    .filter((i) => !i.parent_id)
    .sort(bySort)
    .map((parent) => ({
      ...parent,
      children: visible.filter((c) => c.parent_id === parent.id).sort(bySort),
    }));
}

export const getNavigation = cache(async (location: NavLocation): Promise<NavTreeItem[]> => {
  const sb = getPublicClient();
  if (!sb) return buildNavTree(seedNavigation.filter((n) => n.location === location));
  const { data, error } = await sb
    .from("navigation_items")
    .select("*")
    .eq("location", location)
    .order("sort_order");
  logError("navigation", error);
  return buildNavTree((data ?? []) as NavigationItem[]);
});

/* ------------------------------------------------------------------ */
/* Homepage & pages                                                    */
/* ------------------------------------------------------------------ */

export function rowToBlock(row: HomepageSectionRow): Block {
  return { id: row.id, type: row.type, visible: row.is_visible, data: row.content ?? {} };
}

export const getHomepageBlocks = cache(async (): Promise<Block[]> => {
  const sb = getPublicClient();
  if (!sb) return seedHomepage.filter((b) => b.visible);
  const { data, error } = await sb.from("homepage_sections").select("*").order("sort_order");
  logError("homepage", error);
  return ((data ?? []) as HomepageSectionRow[]).map(rowToBlock).filter((b) => b.visible);
});

export const getPage = cache(async (slug: string): Promise<Page | null> => {
  const sb = getPublicClient();
  if (!sb) return seedPages.find((p) => p.slug === slug && p.status === "published") ?? null;
  const { data, error } = await sb.from("pages").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  logError("page", error);
  if (!data) return null;
  const page = data as Page;
  return { ...page, sections: Array.isArray(page.sections) ? page.sections : [] };
});

export const getPublishedPageSlugs = cache(async (): Promise<{ slug: string; updated_at?: string }[]> => {
  const sb = getPublicClient();
  if (!sb) return seedPages.map((p) => ({ slug: p.slug }));
  const { data, error } = await sb.from("pages").select("slug, updated_at").eq("status", "published");
  logError("page-slugs", error);
  return data ?? [];
});

/* ------------------------------------------------------------------ */
/* Programmes                                                          */
/* ------------------------------------------------------------------ */

export const getProgrammes = cache(async (featuredOnly = false): Promise<Programme[]> => {
  const sb = getPublicClient();
  if (!sb) {
    return seedProgrammes.filter((p) => p.is_published && (!featuredOnly || p.is_featured)).sort(bySort);
  }
  let q = sb.from("programmes").select("*").eq("is_published", true).order("sort_order");
  if (featuredOnly) q = q.eq("is_featured", true);
  const { data, error } = await q;
  logError("programmes", error);
  return (data ?? []) as Programme[];
});

export const getProgramme = cache(async (slug: string): Promise<Programme | null> => {
  const sb = getPublicClient();
  if (!sb) return seedProgrammes.find((p) => p.slug === slug && p.is_published) ?? null;
  const { data, error } = await sb.from("programmes").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  logError("programme", error);
  return (data as Programme) ?? null;
});

/* ------------------------------------------------------------------ */
/* Stories                                                             */
/* ------------------------------------------------------------------ */

export const getCategories = cache(async (): Promise<ArticleCategory[]> => {
  const sb = getPublicClient();
  if (!sb) return [...seedCategories].sort(bySort);
  const { data, error } = await sb.from("article_categories").select("*").order("sort_order");
  logError("categories", error);
  return (data ?? []) as ArticleCategory[];
});

/** Removes characters that have meaning in PostgREST filter strings. */
function cleanSearch(q: string) {
  return q.replace(/[%_,()*\\:."']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export type ArticleQuery = {
  category?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  featuredOnly?: boolean;
  excludeId?: string;
};

export async function getArticles(opts: ArticleQuery = {}): Promise<{ items: Article[]; total: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? 9;
  const search = cleanSearch(opts.q ?? "");
  const categories = await getCategories();
  const category = opts.category ? categories.find((c) => c.slug === opts.category) : undefined;
  const attach = (a: Article): Article => ({
    ...a,
    gallery: Array.isArray(a.gallery) ? a.gallery : [],
    category: categories.find((c) => c.id === a.category_id) ?? null,
  });

  const sb = getPublicClient();
  if (!sb) {
    const now = Date.now();
    let items = seedArticles.filter(
      (a) => a.status === "published" && a.published_at && new Date(a.published_at).getTime() <= now,
    );
    if (category) items = items.filter((a) => a.category_id === category.id);
    if (opts.featuredOnly) items = items.filter((a) => a.is_featured);
    if (opts.excludeId) items = items.filter((a) => a.id !== opts.excludeId);
    if (search) {
      const s = search.toLowerCase();
      items = items.filter((a) => `${a.title} ${a.excerpt}`.toLowerCase().includes(s));
    }
    items.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    return { items: items.slice((page - 1) * pageSize, page * pageSize).map(attach), total: items.length };
  }

  if (opts.category && !category) return { items: [], total: 0 };

  let q = sb
    .from("articles")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (category) q = q.eq("category_id", category.id);
  if (opts.featuredOnly) q = q.eq("is_featured", true);
  if (opts.excludeId) q = q.neq("id", opts.excludeId);
  if (search) q = q.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  const { data, error, count } = await q;
  logError("articles", error);
  return { items: ((data ?? []) as Article[]).map(attach), total: count ?? 0 };
}

export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  const categories = await getCategories();
  const sb = getPublicClient();
  let article: Article | null = null;
  if (!sb) {
    article = seedArticles.find((a) => a.slug === slug && a.status === "published") ?? null;
  } else {
    const { data, error } = await sb.from("articles").select("*").eq("slug", slug).maybeSingle();
    logError("article", error);
    article = (data as Article) ?? null;
  }
  if (!article) return null;
  return {
    ...article,
    gallery: Array.isArray(article.gallery) ? article.gallery : [],
    category: categories.find((c) => c.id === article.category_id) ?? null,
  };
});

export const getArticleSlugs = cache(async (): Promise<{ slug: string; updated_at?: string }[]> => {
  const sb = getPublicClient();
  if (!sb) return seedArticles.filter((a) => a.status === "published").map((a) => ({ slug: a.slug }));
  const { data, error } = await sb.from("articles").select("slug, updated_at").eq("status", "published");
  logError("article-slugs", error);
  return data ?? [];
});

/* ------------------------------------------------------------------ */
/* Team, partners, statistics, credits                                 */
/* ------------------------------------------------------------------ */

export const getTeam = cache(async (): Promise<TeamMember[]> => {
  const sb = getPublicClient();
  if (!sb) return [];
  const { data, error } = await sb.from("team_members").select("*").eq("is_visible", true).order("sort_order");
  logError("team", error);
  return (data ?? []) as TeamMember[];
});

export const getPartners = cache(async (relationship?: PartnerRelationship): Promise<Partner[]> => {
  const sb = getPublicClient();
  if (!sb) {
    return seedPartners.filter((p) => p.is_visible && (!relationship || p.relationship === relationship)).sort(bySort);
  }
  let q = sb.from("partners").select("*").eq("is_visible", true).order("sort_order");
  if (relationship) q = q.eq("relationship", relationship);
  const { data, error } = await q;
  logError("partners", error);
  return (data ?? []) as Partner[];
});

export const getStatistics = cache(async (status?: StatisticStatus): Promise<ImpactStatistic[]> => {
  const sb = getPublicClient();
  if (!sb) return seedStatistics.filter((s) => s.is_visible && (!status || s.status === status)).sort(bySort);
  let q = sb.from("impact_statistics").select("*").eq("is_visible", true).order("sort_order");
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  logError("statistics", error);
  return ((data ?? []) as ImpactStatistic[]).map((s) => ({
    ...s,
    value: Number(s.value),
    // Columns added in migration 5; older databases do not have them yet.
    target_value: s.target_value == null ? null : Number(s.target_value),
    as_of: s.as_of ?? null,
    source_note: s.source_note ?? "",
  }));
});

export const getCreditedMedia = cache(async (): Promise<MediaAsset[]> => {
  const sb = getPublicClient();
  if (!sb) return seedMedia;
  const { data, error } = await sb.from("media_assets").select("*").neq("credit", "").order("folder").order("file_name");
  logError("credits", error);
  return (data ?? []) as MediaAsset[];
});

/* ------------------------------------------------------------------ */
/* Biodiversity explorer, labs, projects, observatory                  */
/* ------------------------------------------------------------------ */

/**
 * True when a table from migration 5 does not exist yet. In that case the
 * bundled reference content is shown instead of an empty page, and the admin
 * dashboard tells the administrator which migration to run.
 */
function isMissingTable(error: { code?: string } | null) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

export const getEcosystems = cache(async (): Promise<Ecosystem[]> => {
  const sb = getPublicClient();
  const seed = () => seedEcosystems.filter((e) => e.is_published).sort(bySort);
  if (!sb) return seed();
  const { data, error } = await sb.from("ecosystems").select("*").eq("is_published", true).order("sort_order");
  if (isMissingTable(error)) return seed();
  logError("ecosystems", error);
  return (data ?? []) as Ecosystem[];
});

export const getBioCategories = cache(async (): Promise<BiodiversityCategory[]> => {
  const sb = getPublicClient();
  const seed = () => [...seedBioCategories].sort(bySort);
  if (!sb) return seed();
  const { data, error } = await sb.from("biodiversity_categories").select("*").order("sort_order");
  if (isMissingTable(error)) return seed();
  logError("bio-categories", error);
  return (data ?? []) as BiodiversityCategory[];
});

export const getSpeciesList = cache(async (): Promise<Species[]> => {
  const [categories, ecosystems] = await Promise.all([getBioCategories(), getEcosystems()]);
  const attach = (s: Species): Species => ({
    ...s,
    sources: Array.isArray(s.sources) ? s.sources : [],
    category: categories.find((c) => c.id === s.category_id) ?? null,
    ecosystem: ecosystems.find((e) => e.id === s.ecosystem_id) ?? null,
  });
  const sb = getPublicClient();
  const seed = () => seedSpecies.filter((s) => s.status === "published").sort(bySort).map(attach);
  if (!sb) return seed();
  const { data, error } = await sb.from("species").select("*").eq("status", "published").order("sort_order");
  if (isMissingTable(error)) return seed();
  logError("species", error);
  return ((data ?? []) as Species[]).map(attach);
});

export const getSpecies = cache(async (slug: string): Promise<Species | null> => {
  return (await getSpeciesList()).find((s) => s.slug === slug) ?? null;
});

export const getNatureLabs = cache(async (): Promise<NatureLab[]> => {
  const sb = getPublicClient();
  const seed = () => seedNatureLabs.filter((l) => l.is_published).sort(bySort);
  if (!sb) return seed();
  const { data, error } = await sb.from("nature_labs").select("*").eq("is_published", true).order("sort_order");
  if (isMissingTable(error)) return seed();
  logError("nature-labs", error);
  return (data ?? []) as NatureLab[];
});

const PROJECT_TABLE: Record<ProjectKind, string> = {
  citizen_science: "citizen_science_projects",
  research: "research_projects",
};

export const getProjects = cache(async (kind: ProjectKind): Promise<Project[]> => {
  const sb = getPublicClient();
  const seed = () =>
    (kind === "research" ? seedResearchProjects : seedCitizenScience).filter((p) => p.is_published).sort(bySort);
  if (!sb) return seed();
  const { data, error } = await sb.from(PROJECT_TABLE[kind]).select("*").eq("is_published", true).order("sort_order");
  if (isMissingTable(error)) return seed();
  logError("projects", error);
  return (data ?? []) as Project[];
});

export const getProject = cache(async (kind: ProjectKind, slug: string): Promise<Project | null> => {
  return (await getProjects(kind)).find((p) => p.slug === slug) ?? null;
});

export const getMilestones = cache(async (): Promise<Milestone[]> => {
  const sb = getPublicClient();
  const seed = () => seedMilestones.filter((m) => m.is_visible).sort(bySort);
  if (!sb) return seed();
  const { data, error } = await sb.from("milestones").select("*").eq("is_visible", true).order("sort_order");
  if (isMissingTable(error)) return seed();
  logError("milestones", error);
  return (data ?? []) as Milestone[];
});

/** Approved, consented observations only. Contact details never leave the database. */
export const getPublicObservations = cache(async (): Promise<PublicObservation[]> => {
  const sb = getPublicClient();
  if (!sb) return [];
  const { data, error } = await sb.from("public_observations").select("*").order("created_at", { ascending: false }).limit(60);
  if (isMissingTable(error)) return [];
  logError("observations", error);
  return (data ?? []) as PublicObservation[];
});

/* ------------------------------------------------------------------ */
/* Pages added or renamed after the first release                      */
/* ------------------------------------------------------------------ */

/** True while the database has not had migration 5 applied. */
const isLegacyDatabase = cache(async (): Promise<boolean> => {
  const sb = getPublicClient();
  if (!sb) return false;
  const { error } = await sb.from("ecosystems").select("id").limit(1);
  return isMissingTable(error);
});

/** "Our Work" was renamed "Our Approach". Either address finds the page under its other name. */
const RENAMED: Record<string, string> = { "our-approach": "our-work", "our-work": "our-approach" };

/** Pages introduced with migration 5. Until it is applied they are served from the bundled starter content. */
const STARTER_PAGES = ["explorer", "citizen-science", "research", "partners"];

/**
 * Finds a page for a public address, allowing for a database that is one
 * release behind the code. `canonical` is set when the visitor should be
 * redirected to the page's current address.
 */
export async function resolvePage(slug: string): Promise<{ page: Page | null; canonical?: string }> {
  const page = await getPage(slug);
  if (page) return { page };
  const other = RENAMED[slug];
  if (other) {
    const renamed = await getPage(other);
    if (renamed) return slug === "our-work" ? { page: renamed, canonical: "/our-approach" } : { page: renamed };
  }
  if (STARTER_PAGES.includes(slug) && (await isLegacyDatabase())) {
    return { page: seedPages.find((p) => p.slug === slug && p.status === "published") ?? null };
  }
  return { page: null };
}
