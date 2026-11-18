import type { Page, SiteSettings } from "@/lib/types";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { PageHero, type Crumb } from "./page-hero";

/** Renders a CMS page: photographic header followed by its ordered sections. */
export function PageView({
  page,
  settings,
  crumbs,
  children,
}: {
  page: Page;
  settings: SiteSettings;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  const hasHero = page.sections.some((s) => s.type === "hero" && s.visible);
  return (
    <>
      {!hasHero ? (
        <PageHero
          eyebrow={page.hero_eyebrow}
          title={page.title}
          description={page.description}
          image={page.hero_image}
          crumbs={crumbs ?? [{ label: page.title }]}
          size={page.hero_image ? "default" : "compact"}
        />
      ) : null}
      {children}
      <BlockRenderer blocks={page.sections} settings={settings} />
    </>
  );
}
