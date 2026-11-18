import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { getProgramme, getProgrammes, getSiteSettings } from "@/lib/data/public";
import { getIcon } from "@/lib/icons";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/page-hero";
import { ProgrammeCard, PROGRAMME_STATUS_LABEL } from "@/components/site/cards";
import { Reveal } from "@/components/site/reveal";
import { RichText, StatusPill } from "@/components/blocks/shared";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const programmes = await getProgrammes();
  return programmes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, programme] = await Promise.all([getSiteSettings(), getProgramme(slug)]);
  if (!programme) return { title: "Programme not found" };
  return pageMetadata({
    settings,
    title: programme.seo_title || programme.title,
    description: programme.seo_description || programme.summary,
    image: programme.cover_image,
    path: `/programmes/${programme.slug}`,
  });
}

export default async function ProgrammePage({ params }: Props) {
  const { slug } = await params;
  const [programme, all] = await Promise.all([getProgramme(slug), getProgrammes()]);
  if (!programme) notFound();
  const Icon = getIcon(programme.icon);
  const others = all.filter((p) => p.id !== programme.id).slice(0, 3);
  const idx = all.findIndex((p) => p.id === programme.id);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;

  return (
    <>
      <PageHero
        eyebrow={programme.category || "Programme area"}
        title={programme.title}
        description={programme.summary}
        image={programme.cover_image}
        crumbs={[{ label: "Programmes", href: "/programmes" }, { label: programme.title }]}
      >
        <div className="mt-8">
          <StatusPill dark>{PROGRAMME_STATUS_LABEL[programme.status]}</StatusPill>
        </div>
      </PageHero>

      <section className="bg-ivory py-20 sm:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-20">
          <aside className="lg:col-span-4">
            <Reveal className="sticky top-28 space-y-6">
              <div className="rounded-md bg-white p-7 ring-1 ring-forest/8">
                <span className="flex size-14 items-center justify-center rounded-md bg-forest text-white">
                  <Icon className="size-6" strokeWidth={1.75} />
                </span>
                <dl className="mt-6 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">Status</dt>
                    <dd className="mt-1 font-medium text-forest">{PROGRAMME_STATUS_LABEL[programme.status]}</dd>
                  </div>
                  {programme.category ? (
                    <div>
                      <dt className="text-xs font-semibold tracking-[0.14em] text-earth uppercase">Focus</dt>
                      <dd className="mt-1 font-medium text-forest">{programme.category}</dd>
                    </div>
                  ) : null}
                </dl>
                {programme.status === "proposed" ? (
                  <p className="mt-6 flex gap-2 border-t border-forest/8 pt-5 text-xs leading-relaxed text-charcoal/65">
                    <Info className="mt-0.5 size-4 shrink-0 text-earth" aria-hidden="true" />
                    This is a proposed long-term programme area. Activities described here are planned, not yet delivered.
                  </p>
                ) : null}
              </div>
              <Link
                href="/get-involved#apply"
                className="group flex items-center justify-between rounded-md bg-forest p-7 text-white transition hover:bg-evergreen"
              >
                <span>
                  <span className="block text-xs font-semibold tracking-[0.14em] text-sage uppercase">Get involved</span>
                  <span className="mt-1 block font-display text-lg font-medium">Help shape {programme.title}</span>
                </span>
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </aside>
          <Reveal className="lg:col-span-8" delay={0.1}>
            <RichText html={programme.description} />
          </Reveal>
        </div>
      </section>

      {others.length > 0 ? (
        <section className="bg-white py-20 sm:py-24">
          <div className="container-site">
            <div className="mb-10 flex items-end justify-between gap-6">
              <h2 className="font-display text-3xl font-medium text-forest">Other programme areas</h2>
              <Link href="/programmes" className="hidden items-center gap-2 text-sm font-semibold text-evergreen sm:inline-flex">
                <ArrowLeft className="size-4" /> All programmes
              </Link>
            </div>
            <ul className="grid gap-6 md:grid-cols-3">
              {others.map((p) => (
                <li key={p.id}>
                  <ProgrammeCard programme={p} />
                </li>
              ))}
            </ul>
            {next ? (
              <p className="mt-10 text-sm text-charcoal/60">
                Next:{" "}
                <Link href={`/programmes/${next.slug}`} className="font-semibold text-evergreen hover:underline">
                  {next.title}
                </Link>
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
