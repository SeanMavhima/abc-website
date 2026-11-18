import type { Metadata } from "next";
import { getPage, getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import type { Page } from "@/lib/types";
import { PageView } from "@/components/site/page-view";

export const revalidate = 300;

const FALLBACK: Page = {
  id: "programmes",
  slug: "programmes",
  title: "Programmes",
  description: "",
  hero_eyebrow: "Programme areas",
  hero_image: null,
  status: "published",
  is_system: true,
  seo_title: "",
  seo_description: "",
  sections: [
    { id: "programmes-list", type: "programmes", visible: true, data: { heading: "", featured_only: false } },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const [settings, page] = await Promise.all([getSiteSettings(), getPage("programmes")]);
  const p = page ?? FALLBACK;
  return pageMetadata({
    settings,
    title: p.seo_title || p.title,
    description: p.seo_description || p.description,
    image: p.hero_image,
    path: "/programmes",
  });
}

export default async function ProgrammesPage() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPage("programmes")]);
  return <PageView page={page ?? FALLBACK} settings={settings} />;
}
