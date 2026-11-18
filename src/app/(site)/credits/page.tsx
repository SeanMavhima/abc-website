import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getCreditedMedia, getSiteSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/page-hero";
import { SmartImage } from "@/components/site/smart-image";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata({
    settings,
    title: "Image credits",
    description: "Credits and licences for the photographs used on this website.",
    path: "/credits",
  });
}

export default async function CreditsPage() {
  const media = await getCreditedMedia();
  return (
    <>
      <PageHero
        eyebrow="Information"
        title="Image credits"
        description="We are grateful to the photographers whose work appears on this website. Each photograph is used under the licence shown."
        crumbs={[{ label: "Image credits" }]}
        size="compact"
      />
      <section className="bg-white py-16 sm:py-24">
        <div className="container-site">
          {media.length === 0 ? (
            <p className="text-charcoal/70">No credited images yet.</p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((m) => (
                <li key={m.id} className="overflow-hidden rounded-md bg-ivory ring-1 ring-forest/8">
                  {m.mime_type.startsWith("image/") ? (
                    <div className="relative aspect-[3/2] bg-forest">
                      <SmartImage image={{ src: m.url, alt: m.alt_text }} fill sizes="(min-width: 1024px) 33vw, 50vw" />
                    </div>
                  ) : null}
                  <div className="p-5">
                    {m.caption ? <p className="font-display font-medium text-forest">{m.caption}</p> : null}
                    <p className="mt-1 text-sm text-charcoal/70">{m.credit}</p>
                    {m.source_url ? (
                      <a
                        href={m.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-evergreen hover:underline"
                      >
                        View source and licence <ExternalLink className="size-3.5" />
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
