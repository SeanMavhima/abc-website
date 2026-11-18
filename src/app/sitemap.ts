import type { MetadataRoute } from "next";
import { getArticleSlugs, getProgrammes, getProjects, getPublishedPageSlugs, getSpeciesList } from "@/lib/data/public";
import { RESERVED_SLUGS } from "@/lib/reserved-slugs";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, programmes, articles, species, citizenScience, research] = await Promise.all([
    getPublishedPageSlugs(),
    getProgrammes(),
    getArticleSlugs(),
    getSpeciesList(),
    getProjects("citizen_science"),
    getProjects("research"),
  ]);
  const fixed = ["/", "/programmes", "/stories", "/credits"].map((p) => ({ url: absoluteUrl(p) }));
  return [
    ...fixed,
    ...pages
      .filter((p) => !RESERVED_SLUGS.includes(p.slug))
      .map((p) => ({ url: absoluteUrl(`/${p.slug}`), lastModified: p.updated_at })),
    ...programmes.map((p) => ({ url: absoluteUrl(`/programmes/${p.slug}`), lastModified: p.updated_at })),
    ...articles.map((a) => ({ url: absoluteUrl(`/stories/${a.slug}`), lastModified: a.updated_at })),
    ...species.map((s) => ({ url: absoluteUrl(`/explorer/${s.slug}`), lastModified: s.updated_at })),
    ...citizenScience.map((p) => ({ url: absoluteUrl(`/citizen-science/${p.slug}`), lastModified: p.updated_at })),
    ...research.map((p) => ({ url: absoluteUrl(`/research/${p.slug}`), lastModified: p.updated_at })),
  ];
}
