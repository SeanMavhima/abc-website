import Link from "next/link";
import { ArrowUpRight, Info, Lock } from "lucide-react";
import type { LinkRef, ProjectKind, SiteSettings, Species } from "@/lib/types";
import {
  getBioCategories,
  getEcosystems,
  getMilestones,
  getNatureLabs,
  getProjects,
  getPublicObservations,
  getSpeciesList,
} from "@/lib/data/public";
import { sanitizeRichText } from "@/lib/sanitize";
import { LAB_STATUS, MILESTONE_STATUS, PROJECT_STATUS, observationCategoryLabel } from "@/lib/status";
import { cn, formatDate, num, str } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";
import { ImagePlaceholder, SmartImage } from "@/components/site/smart-image";
import { StatusChip } from "@/components/site/status-chip";
import { AtlasExplorer } from "@/components/nature/atlas-explorer";
import { SpeciesCard, SpeciesExplorer, type SpeciesCardData } from "@/components/nature/species-explorer";
import { ObservationForm } from "@/components/forms/observation-form";
import { ArrowLink, SectionHeading, SectionShell, hasLink } from "./shared";

type Data = { data: Record<string, unknown> };

function Disclosure({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={cn("flex items-start gap-2.5 text-sm", dark ? "text-white/65" : "text-charcoal/65")}>
      <Info className={cn("mt-0.5 size-4 shrink-0", dark ? "text-gold" : "text-earth")} aria-hidden="true" />
      {children}
    </p>
  );
}

/** A designed empty state: says plainly that there is nothing yet, and why. */
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-forest/25 bg-white/50 px-6 py-12 text-center sm:px-10">
      <span className="label-mono text-earth">Nothing to show yet</span>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-charcoal/75">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Living atlas                                                        */
/* ------------------------------------------------------------------ */

export async function AtlasBlock({ data }: Data) {
  const [ecosystems, species] = await Promise.all([getEcosystems(), getSpeciesList()]);
  if (ecosystems.length === 0) return null;
  const link = data.link as LinkRef;
  const note = str(data.note);
  return (
    <section id={str(data.anchor) || undefined} className="relative overflow-hidden bg-night py-20 text-white sm:py-28">
      <div className="container-site">
        <SectionHeading
          eyebrow={str(data.eyebrow)}
          heading={str(data.heading)}
          intro={str(data.intro)}
          dark
          action={hasLink(link) ? <ArrowLink link={link} variant="text" dark /> : undefined}
        />
        <AtlasExplorer
          ecosystems={ecosystems.map((e) => ({ ...e, description: sanitizeRichText(e.description) }))}
          species={species.map((s) => ({
            slug: s.slug,
            common_name: s.common_name,
            scientific_name: s.scientific_name,
            photo: s.photo,
            ecosystem_id: s.ecosystem_id,
          }))}
        />
        {note ? (
          <div className="mt-12 border-t border-white/15 pt-6">
            <Disclosure dark>{note}</Disclosure>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Species                                                             */
/* ------------------------------------------------------------------ */

export function toCard(s: Species): SpeciesCardData {
  return {
    slug: s.slug,
    common_name: s.common_name,
    scientific_name: s.scientific_name,
    local_name: s.local_name,
    summary: s.summary,
    photo: s.photo,
    conservation_status: s.conservation_status,
    entry_type: s.entry_type,
    category: s.category ? { slug: s.category.slug, name: s.category.name } : null,
    ecosystem: s.ecosystem ? { slug: s.ecosystem.slug, name: s.ecosystem.name } : null,
  };
}

export async function SpeciesBlock({ data }: Data) {
  const [all, categories, ecosystems] = await Promise.all([getSpeciesList(), getBioCategories(), getEcosystems()]);
  const featured = str(data.mode, "all") === "featured";
  const list = featured ? all.filter((s) => s.is_featured).slice(0, Math.min(24, Math.max(1, num(data.count, 6)))) : all;
  const link = data.link as LinkRef;
  return (
    <SectionShell id={str(data.anchor)} background="ivory">
      <div className="container-site">
        <SectionHeading
          eyebrow={str(data.eyebrow)}
          heading={str(data.heading)}
          intro={str(data.intro)}
          action={hasLink(link) ? <ArrowLink link={link} variant="text" /> : undefined}
        />
        {list.length === 0 ? (
          <Empty>No species entries have been published yet.</Empty>
        ) : featured ? (
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((s, i) => (
              <Reveal as="li" key={s.id} delay={(i % 4) * 0.07}>
                <SpeciesCard species={toCard(s)} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <SpeciesExplorer
            species={list.map(toCard)}
            categories={categories.filter((c) => all.some((s) => s.category_id === c.id)).map((c) => ({ slug: c.slug, name: c.name }))}
            ecosystems={ecosystems.filter((e) => all.some((s) => s.ecosystem_id === e.id)).map((e) => ({ slug: e.slug, name: e.name }))}
          />
        )}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Nature Labs                                                         */
/* ------------------------------------------------------------------ */

export async function NatureLabsBlock({ data }: Data) {
  const labs = await getNatureLabs();
  const empty = str(data.empty_text);
  if (labs.length === 0 && !empty) return null;
  return (
    <SectionShell id={str(data.anchor)} background="ivory">
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} />
        {labs.length === 0 ? (
          <Empty>{empty}</Empty>
        ) : (
          <ul className="grid gap-8 md:grid-cols-2">
            {labs.map((lab, i) => {
              const status = LAB_STATUS[lab.status];
              const description = sanitizeRichText(lab.description);
              return (
                <Reveal as="li" key={lab.id} delay={(i % 2) * 0.08} className="flex flex-col overflow-hidden rounded-md bg-white ring-1 ring-forest/10">
                  <div className="relative aspect-[16/9] bg-forest">
                    {lab.cover_image?.src ? <SmartImage image={lab.cover_image} fallbackAlt={lab.name} fill sizes="(min-width: 768px) 50vw, 100vw" /> : <ImagePlaceholder />}
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <StatusChip label={status.label} tone={status.tone} className="self-start" />
                    <h3 className="mt-4 font-display text-2xl font-medium text-forest">{lab.name}</h3>
                    {lab.summary ? <p className="mt-2 leading-relaxed text-charcoal/75">{lab.summary}</p> : null}
                    {description && description !== "<p></p>" ? (
                      <div className="prose prose-abc mt-4 max-w-none text-[0.95rem]" dangerouslySetInnerHTML={{ __html: description }} />
                    ) : null}
                    <dl className="mt-6 grid gap-4 border-t border-forest/10 pt-5 text-sm sm:grid-cols-3">
                      {(
                        [
                          ["Region", lab.region],
                          ["Hosted with", lab.host],
                          ["Focus", lab.focus],
                        ] as const
                      )
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <div key={k}>
                            <dt className="label-mono text-charcoal/55">{k}</dt>
                            <dd className="mt-1 text-charcoal/85">{v}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Citizen science and research projects                               */
/* ------------------------------------------------------------------ */

export const PROJECT_PATH: Record<ProjectKind, string> = { citizen_science: "/citizen-science", research: "/research" };

export async function ProjectsBlock({ data }: Data) {
  const kind: ProjectKind = str(data.kind) === "research" ? "research" : "citizen_science";
  const projects = await getProjects(kind);
  const empty = str(data.empty_text);
  if (projects.length === 0 && !empty) return null;
  return (
    <SectionShell id={str(data.anchor)} background="ivory">
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} />
        {projects.length === 0 ? (
          <Empty>{empty}</Empty>
        ) : (
          <ul className="border-t border-forest/15">
            {projects.map((p, i) => {
              const status = PROJECT_STATUS[p.status];
              return (
                <Reveal as="li" key={p.id} delay={Math.min(i, 4) * 0.06} className="border-b border-forest/15">
                  <Link href={`${PROJECT_PATH[kind]}/${p.slug}`} className="group grid gap-6 py-8 sm:py-10 md:grid-cols-12 md:gap-10">
                    <div className="md:col-span-1">
                      <span className="label-mono text-charcoal/50">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="md:col-span-7">
                      <StatusChip label={status.label} tone={status.tone} />
                      <h3 className="mt-4 font-display text-3xl leading-tight font-medium text-forest group-hover:text-evergreen sm:text-4xl">{p.title}</h3>
                      {p.research_question ? (
                        <p className="mt-4 border-l-2 border-gold pl-4 font-display text-xl leading-snug text-charcoal/85 italic">{p.research_question}</p>
                      ) : null}
                      {p.summary ? <p className="mt-4 max-w-2xl leading-relaxed text-charcoal/70">{p.summary}</p> : null}
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-evergreen">
                        Read more
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="md:col-span-4">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-forest">
                        {p.cover_image?.src ? (
                          <SmartImage
                            image={p.cover_image}
                            fallbackAlt=""
                            fill
                            sizes="(min-width: 768px) 33vw, 100vw"
                            className="transition-transform duration-[1600ms] ease-out group-hover:scale-105"
                          />
                        ) : (
                          <ImagePlaceholder />
                        )}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */
/* Milestones                                                          */
/* ------------------------------------------------------------------ */

export async function MilestonesBlock({ data }: Data) {
  const milestones = await getMilestones();
  if (milestones.length === 0) return null;
  const note = str(data.note);
  return (
    <section id={str(data.anchor) || undefined} className="bg-forest pb-20 text-white sm:pb-28">
      <div className="container-site">
        <div className="border-t border-white/15 pt-14 sm:pt-20">
          <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} dark />
          <ol className="grid gap-px overflow-hidden rounded-md bg-white/10 sm:grid-cols-2 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ "--n": Math.min(milestones.length, 5) } as React.CSSProperties}>
            {milestones.map((m, i) => {
              const status = MILESTONE_STATUS[m.status];
              return (
                <Reveal as="li" key={m.id} delay={Math.min(i, 5) * 0.07} className="flex flex-col bg-forest p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-4xl font-normal text-white/30">{String(i + 1).padStart(2, "0")}</span>
                    <StatusChip label={status.label} tone={status.tone} dark />
                  </div>
                  <h3 className="mt-8 font-display text-xl leading-snug font-medium">{m.title}</h3>
                  {m.description ? <p className="mt-2 text-sm leading-relaxed text-white/65">{m.description}</p> : null}
                  {m.period ? <p className="label-mono mt-auto pt-6 text-white/45">{m.period}</p> : null}
                </Reveal>
              );
            })}
          </ol>
          {note ? (
            <div className="mt-8">
              <Disclosure dark>{note}</Disclosure>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Community observations                                              */
/* ------------------------------------------------------------------ */

export async function ObservationsBlock({ data, settings }: Data & { settings: SiteSettings }) {
  const open = settings.observations_open;
  const observations = open ? await getPublicObservations() : [];
  return (
    <SectionShell id={str(data.anchor)} background="white">
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} />
        {!open ? (
          <div className="flex flex-col gap-5 rounded-md border border-forest/15 bg-ivory p-6 sm:flex-row sm:items-start sm:gap-7 sm:p-10">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-forest text-sand">
              <Lock className="size-5" aria-hidden="true" />
            </span>
            <div>
              <StatusChip label="Not yet open" tone="outline" />
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-charcoal/80">{str(data.closed_text) || "Observation submissions are not open yet."}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h3 className="label-mono text-charcoal/55">Approved observations</h3>
              {observations.length === 0 ? (
                <p className="mt-4 rounded-md border border-dashed border-forest/25 px-6 py-10 text-charcoal/70">
                  No observations have been approved for publication yet.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-forest/10 border-y border-forest/10">
                  {observations.map((o) => (
                    <li key={o.id} className="py-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="label-mono text-earth">{observationCategoryLabel(o.category)}</span>
                        {o.observed_on ? <span className="label-mono text-charcoal/50">{formatDate(o.observed_on)}</span> : null}
                        {o.general_area ? <span className="label-mono text-charcoal/50">{o.general_area}</span> : null}
                      </div>
                      <p className="mt-2 font-display text-xl text-forest">{o.what}</p>
                      {o.notes ? <p className="mt-1.5 leading-relaxed text-charcoal/75">{o.notes}</p> : null}
                      {o.observer ? <p className="mt-2 text-sm text-charcoal/55">Recorded by {o.observer}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-md bg-ivory p-6 ring-1 ring-forest/10 sm:p-8">
                <h3 className="font-display text-2xl font-medium text-forest">Submit an observation</h3>
                <p className="mt-2 mb-6 text-sm leading-relaxed text-charcoal/70">Reviewed by ABC before publication. Fields marked optional can be left empty.</p>
                <ObservationForm />
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}
