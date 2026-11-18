import { ExternalLink, Info } from "lucide-react";
import type { LinkRef, Partner, PartnerRelationship, StatisticStatus } from "@/lib/types";
import { getArticles, getPartners, getProgrammes, getStatistics, getTeam } from "@/lib/data/public";
import { getIcon } from "@/lib/icons";
import { STATISTIC_STATUS } from "@/lib/status";
import { bool, cn, formatDate, num, str } from "@/lib/utils";
import { StatusChip } from "@/components/site/status-chip";
import { Reveal } from "@/components/site/reveal";
import { SmartImage } from "@/components/site/smart-image";
import { ProgrammeCard, StoryCard } from "@/components/site/cards";
import { socialIcon } from "@/components/site/site-footer";
import { Counter } from "./counter";
import { ArrowLink, SectionHeading, SectionShell, hasLink } from "./shared";

type Data = { data: Record<string, unknown> };


/* ------------------------------------------------------------------ */

/**
 * Impact observatory. The way a figure is drawn says what kind of figure it
 * is: targets are outlined (nothing has been filled in yet), results are
 * solid. Every figure also carries its status in words.
 */
export async function StatisticsBlock({ data }: Data) {
  const filter = str(data.status_filter, "all");
  const stats = await getStatistics(filter === "all" ? undefined : (filter as StatisticStatus));
  if (stats.length === 0) return null;
  const note = str(data.note);
  const present = (Object.keys(STATISTIC_STATUS) as StatisticStatus[]).filter((k) => stats.some((s) => s.status === k));

  return (
    <section id={str(data.anchor) || undefined} className="relative isolate overflow-hidden bg-forest py-20 text-white sm:py-28">
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} dark />
        <ul
          className={cn(
            "grid gap-px overflow-hidden rounded-md bg-white/10 ring-1 ring-white/10",
            stats.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : stats.length === 3 ? "md:grid-cols-3" : "sm:grid-cols-2",
          )}
        >
          {stats.map((s, i) => {
            const Icon = getIcon(s.icon);
            const status = STATISTIC_STATUS[s.status];
            const outlined = status.tone === "outline";
            const progress = s.target_value && s.target_value > 0 && !outlined ? Math.min(1, Math.max(0, s.value / s.target_value)) : null;
            return (
              <Reveal as="li" key={s.id} delay={i * 0.1} className="flex flex-col bg-forest p-7 sm:p-9">
                <div className="flex items-center justify-between gap-3">
                  <Icon className="size-6 text-sage" strokeWidth={1.5} aria-hidden="true" />
                  <StatusChip label={status.label} tone={status.tone} dark />
                </div>
                <p
                  className={cn("mt-10 font-display text-7xl leading-none font-normal tracking-tight sm:text-8xl", outlined && "text-transparent")}
                  style={outlined ? { WebkitTextStroke: "1.25px rgba(255,255,255,0.85)" } : undefined}
                >
                  <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="mt-5 font-display text-xl font-medium">{s.label}</p>
                {s.description ? <p className="mt-1.5 text-sm leading-relaxed text-white/65">{s.description}</p> : null}
                {progress !== null ? (
                  <div className="mt-5">
                    <div
                      className="h-1 overflow-hidden rounded-full bg-white/15"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={s.target_value ?? undefined}
                      aria-valuenow={s.value}
                      aria-label={`${s.label}: ${s.value} of a target of ${s.target_value}`}
                    >
                      <div className="h-full rounded-full bg-gold" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <p className="label-mono mt-2 text-white/55">
                      {Math.round(progress * 100)}% of target {s.target_value?.toLocaleString("en-GB")}
                    </p>
                  </div>
                ) : null}
                {s.as_of || s.source_note ? (
                  <p className="mt-auto pt-6 text-xs leading-relaxed text-white/50">
                    {s.as_of ? <span className="label-mono mr-2 text-white/60">As of {formatDate(s.as_of, { day: "numeric", month: "short", year: "numeric" })}</span> : null}
                    {s.source_note}
                  </p>
                ) : null}
              </Reveal>
            );
          })}
        </ul>
        {note ? (
          <p className="mt-8 flex items-start gap-2.5 text-sm text-white/70">
            <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
            {note}
          </p>
        ) : null}
        {data.show_legend !== false ? (
          <dl className="mt-10 grid gap-x-10 gap-y-5 border-t border-white/15 pt-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="label-mono text-white/50">How to read these figures</dt>
              <dd className="mt-1 text-sm text-white/70">Outlined numbers are targets. Solid numbers are results.</dd>
            </div>
            {present.map((k) => (
              <div key={k} className="flex items-start gap-4">
                <dt className="w-40 shrink-0">
                  <StatusChip label={STATISTIC_STATUS[k].label} tone={STATISTIC_STATUS[k].tone} dark />
                </dt>
                <dd className="text-sm leading-relaxed text-white/70">{STATISTIC_STATUS[k].meaning}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export async function ProgrammesBlock({ data }: Data) {
  const programmes = await getProgrammes(bool(data.featured_only));
  if (programmes.length === 0) return null;
  const link = data.link as LinkRef;
  const editorial = programmes.length === 5;
  return (
    <SectionShell id={str(data.anchor)} background="white">
      <div className="container-site">
        <SectionHeading
          eyebrow={str(data.eyebrow)}
          heading={str(data.heading)}
          intro={str(data.intro)}
          action={hasLink(link) ? <ArrowLink link={link} variant="text" /> : undefined}
        />
        <ul className={cn("grid gap-6", editorial ? "md:grid-cols-2 lg:grid-cols-6" : "md:grid-cols-2 lg:grid-cols-3")}>
          {programmes.map((p, i) => (
            <Reveal
              as="li"
              key={p.id}
              delay={(i % 3) * 0.08}
              className={cn(editorial && (i < 2 ? "lg:col-span-3" : "lg:col-span-2"))}
            >
              <ProgrammeCard programme={p} size={editorial && i < 2 ? "large" : "default"} />
            </Reveal>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */

export async function StoriesBlock({ data }: Data) {
  const count = Math.min(9, Math.max(1, num(data.count, 3)));
  const { items } = await getArticles({ pageSize: count, featuredOnly: bool(data.featured_only), category: str(data.category) || undefined });
  if (items.length === 0) return null;
  const link = data.link as LinkRef;
  const [first, ...rest] = items;
  return (
    <SectionShell id={str(data.anchor)} background="ivory">
      <div className="container-site">
        <SectionHeading
          eyebrow={str(data.eyebrow)}
          heading={str(data.heading)}
          intro={str(data.intro)}
          action={hasLink(link) ? <ArrowLink link={link} variant="text" /> : undefined}
        />
        {rest.length === 0 ? (
          <Reveal>
            <StoryCard article={first} variant="feature" />
          </Reveal>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <Reveal className="lg:col-span-7">
              <StoryCard article={first} variant="feature" />
            </Reveal>
            <ul className="flex flex-col justify-center gap-8 lg:col-span-5">
              {rest.map((a, i) => (
                <Reveal as="li" key={a.id} delay={0.1 + i * 0.08}>
                  <StoryCard article={a} variant="compact" />
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */

const DEFAULT_PARTNER_NOTES: Record<PartnerRelationship, string> = {
  prospective:
    "These organisations have been identified as potential collaborators for future engagement. No formal partnership has been established.",
  confirmed: "",
  supporting: "",
};

export async function PartnersBlock({ data }: Data) {
  const relationship = (str(data.relationship, "confirmed") as PartnerRelationship) || "confirmed";
  const partners = await getPartners(relationship);
  const emptyText = str(data.empty_text);
  const link = data.link as LinkRef;
  if (partners.length === 0) {
    // Nothing to show: say so plainly if a message is set, otherwise hide the section.
    if (!emptyText) return null;
    return (
      <SectionShell id={str(data.anchor)} background="white">
        <div className="container-site">
          <div className="grid gap-8 border-y border-forest/15 py-12 md:grid-cols-12 md:gap-12 sm:py-16">
            <div className="md:col-span-5">
              {str(data.eyebrow) ? <p className="eyebrow text-earth">{str(data.eyebrow)}</p> : null}
              <h2 className="mt-4 font-display text-3xl leading-tight font-medium text-forest sm:text-4xl">{str(data.heading)}</h2>
            </div>
            <div className="md:col-span-7">
              <p className="text-xl leading-relaxed text-charcoal/80">{emptyText}</p>
              {hasLink(link) ? <ArrowLink link={link} className="mt-8" /> : null}
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }
  const note = str(data.note) || DEFAULT_PARTNER_NOTES[relationship];
  return (
    <SectionShell id={str(data.anchor)} background="white">
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} align="center" />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {partners.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 6) * 0.05}>
              <PartnerTile partner={p} />
            </Reveal>
          ))}
        </ul>
        {note ? (
          <p className="mx-auto mt-10 flex max-w-2xl items-start justify-center gap-2.5 text-center text-sm text-charcoal/60">
            <Info className="mt-0.5 size-4 shrink-0 text-earth" aria-hidden="true" />
            {note}
          </p>
        ) : null}
      </div>
    </SectionShell>
  );
}

function PartnerTile({ partner }: { partner: Partner }) {
  const inner = partner.logo?.src ? (
    <div className="relative h-16 w-full">
      <SmartImage
        image={partner.logo}
        fallbackAlt={partner.name}
        fill
        sizes="200px"
        className="object-contain grayscale transition duration-500 group-hover:grayscale-0"
      />
    </div>
  ) : (
    <span className="text-center font-display text-sm leading-snug font-medium text-forest">{partner.name}</span>
  );
  const cls =
    "group flex h-32 items-center justify-center rounded-md bg-ivory p-5 ring-1 ring-forest/6 transition hover:bg-white hover:shadow-lg";
  return partner.website_url ? (
    <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className={cls} title={partner.name}>
      {inner}
      <span className="sr-only">{partner.name} (opens in a new tab)</span>
    </a>
  ) : (
    <div className={cls} title={partner.name}>
      {inner}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export async function TeamBlock({ data }: Data) {
  const team = await getTeam();
  if (team.length === 0) return null;
  return (
    <SectionShell id={str(data.anchor)} background="ivory">
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} />
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, i) => (
            <Reveal as="li" key={m.id} delay={(i % 4) * 0.08}>
              <div className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-forest">
                  {m.photo?.src ? (
                    <SmartImage
                      image={m.photo}
                      fallbackAlt={m.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="transition-transform duration-[1400ms] group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center font-display text-5xl font-medium text-sage/60">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                </div>
                <h3 className="mt-5 font-display text-xl font-medium text-forest">{m.name}</h3>
                {m.role ? <p className="mt-1 text-sm font-medium text-earth">{m.role}</p> : null}
                {m.bio ? <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{m.bio}</p> : null}
                {m.social_links?.length ? (
                  <ul className="mt-4 flex gap-2">
                    {m.social_links.map((s) => {
                      const Icon = socialIcon(s.platform);
                      return (
                        <li key={s.url}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${m.name} on ${s.platform}`}
                            className="flex size-9 items-center justify-center rounded-full text-forest ring-1 ring-forest/15 transition hover:bg-forest hover:text-white"
                          >
                            {Icon ? <Icon className="size-4" /> : <ExternalLink className="size-4" />}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
