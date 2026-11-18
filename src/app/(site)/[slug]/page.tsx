import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getPublishedPageSlugs, getSiteSettings, resolvePage } from "@/lib/data/public";
import { RESERVED_SLUGS } from "@/lib/reserved-slugs";
import { pageMetadata } from "@/lib/seo";
import { PageView } from "@/components/site/page-view";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPublishedPageSlugs();
  return slugs.filter((s) => !RESERVED_SLUGS.includes(s.slug)).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, { page }] = await Promise.all([getSiteSettings(), resolvePage(slug)]);
  if (!page || RESERVED_SLUGS.includes(slug)) return { title: "Page not found" };
  return pageMetadata({
    settings,
    title: page.seo_title || page.title,
    description: page.seo_description || page.description,
    image: page.hero_image,
    path: `/${slug}`,
  });
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED_SLUGS.includes(slug)) notFound();
  const [settings, { page, canonical }] = await Promise.all([getSiteSettings(), resolvePage(slug)]);
  if (canonical) permanentRedirect(canonical);
  if (!page) notFound();
  return <PageView page={page} settings={settings} />;
}
