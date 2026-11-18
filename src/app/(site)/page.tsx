import type { Metadata } from "next";
import { getHomepageBlocks, getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { BlockView } from "@/components/blocks/block-renderer";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return { ...pageMetadata({ settings, path: "/" }), title: { absolute: settings.seo_title || settings.org_name } };
}

export default async function HomePage() {
  const [settings, blocks] = await Promise.all([getSiteSettings(), getHomepageBlocks()]);
  const heroIndex = blocks.findIndex((b) => b.type === "hero");
  const hero = heroIndex === 0 ? blocks[0] : null;
  const rest = hero ? blocks.slice(1) : blocks;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: settings.org_name,
    alternateName: settings.short_name,
    slogan: settings.tagline,
    description: settings.description,
    ...(settings.contact_email ? { email: settings.contact_email } : {}),
    sameAs: settings.social_links.map((s) => s.url),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {hero ? <BlockView block={hero} settings={settings} /> : <div className="h-24 bg-forest" />}
      <div id="content">
        {rest.map((block) => (
          <BlockView key={block.id} block={block} settings={settings} />
        ))}
      </div>
    </>
  );
}
