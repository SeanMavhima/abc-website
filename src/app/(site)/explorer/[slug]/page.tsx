import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Info } from "lucide-react";
import { getSiteSettings, getSpecies, getSpeciesList } from "@/lib/data/public";
import { sanitizeRichText } from "@/lib/sanitize";
import { pageMetadata } from "@/lib/seo";
import { IUCN_STATUS } from "@/lib/status";
import { SmartImage } from "@/components/site/smart-image";
import { IucnChip } from "@/components/site/status-chip";
import { NotebookButton } from "@/components/nature/notebook";
import { SpeciesCard } from "@/components/nature/species-explorer";
import { toCard } from "@/components/blocks/nature-blocks";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSpeciesList()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, species] = await Promise.all([getSiteSettings(), getSpecies(slug)]);
  if (!species) return { title: "Species not found" };
  return pageMetadata({
    settings,
    title: species.scientific_name ? `${species.common_name} (${species.scientific_name})` : species.common_name,
    description: species.summary,
    image: species.photo,
    path: `/explorer/${species.slug}`,
  });
}

export default async function SpeciesPage({ params }: Props) {
  const { slug } = await params;
  const [species, all] = await Promise.all([getSpecies(slug), getSpeciesList()]);
  if (!species) notFound();

  const description = sanitizeRichText(species.description);
  const neighbours = all.filter((s) => s.id !== species.id && s.ecosystem_id && s.ecosystem_id === species.ecosystem_id).slice(0, 4);
  const iucn = IUCN_STATUS[species.conservation_status];
  const isObservation = species.entry_type === "abc_observation";

  const facts: [string, React.ReactNode][] = [
    ["Group", species.category?.name],
    ["Scientific name", species.scientific_name ? <span className="sci-name text-base">{species.scientific_name}</span> : null],
    ["Name in Kinyarwanda", species.local_name],
    ["Habitat", species.ecosystem?.name],
    ["IUCN Red List", iucn ? <IucnChip code={species.conservation_status} /> : null],
  ];

  return (
    <article>
      {/* Header: the photograph is the specimen plate, the text its label */}
      <header className="bg-night pt-28 text-white sm:pt-32">
        <div className="container-site grid gap-10 pb-14 lg:grid-cols-12 lg:gap-14 lg:pb-20">
          <div className="flex flex-col justify-end lg:col-span-5">
            <nav aria-label="Breadcrumb">
              <Link href="/explorer#species" className="label-mono inline-flex items-center gap-2 text-white/65 hover:text-white">
                <ArrowLeft className="size-3.5" aria-hidden="true" /> Biodiversity Explorer
              </Link>
            </nav>
            <p className="label-mono mt-8 text-gold">{isObservation ? "ABC field observation" : "Reference entry"}</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.02] font-normal sm:text-6xl">{species.common_name}</h1>
            {species.scientific_name ? <p className="sci-name mt-3 text-2xl text-white/75">{species.scientific_name}</p> : null}
            {species.summary ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{species.summary}</p> : null}
            <div className="mt-8">
              <NotebookButton
                variant="full"
                className="bg-white text-forest hover:bg-sand"
                entry={{ slug: species.slug, common_name: species.common_name, scientific_name: species.scientific_name, photo: species.photo }}
              />
            </div>
          </div>
          <figure className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-forest">
              {species.photo?.src ? <SmartImage image={species.photo} fallbackAlt={species.common_name} fill priority sizes="(min-width: 1024px) 58vw, 100vw" /> : null}
            </div>
            {species.photo?.credit ? <figcaption className="mt-2 text-[11px] text-white/50">Photo: {species.photo.credit}</figcaption> : null}
          </figure>
        </div>
      </header>

      <div className="bg-ivory py-16 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {description && description !== "<p></p>" ? (
              <div className="prose prose-lg prose-abc max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
            ) : null}

            {(
              [
                ["Where it lives", species.habitat],
                ["Its role in the ecosystem", species.ecological_role],
                ["Conservation", species.conservation_notes],
              ] as const
            )
              .filter(([, text]) => text)
              .map(([title, text]) => (
                <section key={title} className="mt-10 border-t border-forest/15 pt-8">
                  <h2 className="label-mono text-earth">{title}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-charcoal/85">{text}</p>
                </section>
              ))}

            {species.sources.length > 0 ? (
              <section className="mt-10 border-t border-forest/15 pt-8">
                <h2 className="label-mono text-earth">Find out more</h2>
                <ul className="mt-3 space-y-2">
                  {species.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-evergreen underline underline-offset-4 hover:text-forest">
                        {s.label}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="lg:col-span-5">
            <div className="rounded-md bg-white p-6 ring-1 ring-forest/10 sm:p-8">
              <h2 className="label-mono text-charcoal/55">Field label</h2>
              <dl className="mt-4 divide-y divide-forest/10">
                {facts
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 py-3">
                      <dt className="text-sm text-charcoal/60">{k}</dt>
                      <dd className="text-right font-medium text-forest">{v}</dd>
                    </div>
                  ))}
              </dl>
              {species.ecosystem ? (
                <Link href={`/explorer#${species.ecosystem.slug}`} className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-evergreen hover:text-forest">
                  See this habitat in the atlas
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <p className="mt-5 flex items-start gap-2.5 text-sm leading-relaxed text-charcoal/65">
              <Info className="mt-0.5 size-4 shrink-0 text-earth" aria-hidden="true" />
              {isObservation
                ? "This entry is based on records made by ABC participants. Precise locations are not published."
                : "This is educational reference information, not an ABC field observation. The photograph illustrates the species and may have been taken elsewhere. Conservation statuses change: check the IUCN Red List for the current assessment."}
            </p>
          </aside>
        </div>
      </div>

      {neighbours.length > 0 ? (
        <section className="bg-white py-16 sm:py-24">
          <div className="container-site">
            <p className="eyebrow text-earth">Connected life</p>
            <h2 className="mt-4 font-display text-3xl font-medium text-forest sm:text-4xl">Sharing the same habitat</h2>
            <p className="mt-3 max-w-2xl text-lg text-charcoal/70">
              Other species in the explorer that live in {species.ecosystem?.name.toLowerCase() ?? "the same habitat"}.
            </p>
            <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {neighbours.map((s) => (
                <li key={s.id}>
                  <SpeciesCard species={toCard(s)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}
