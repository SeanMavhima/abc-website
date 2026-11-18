import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import type { NatureLab, Project } from "@/lib/types";
import { sanitizeRichText } from "@/lib/sanitize";
import { PROJECT_STATUS } from "@/lib/status";
import { formatDate } from "@/lib/utils";
import { SmartImage } from "./smart-image";
import { StatusChip } from "./status-chip";

const lines = (text: string) =>
  text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

/** Detail page shared by citizen science projects and research projects. */
export function ProjectView({ project, lab, back }: { project: Project; lab: NatureLab | null; back: { href: string; label: string } }) {
  const status = PROJECT_STATUS[project.status];
  const description = sanitizeRichText(project.description);
  const findings = sanitizeRichText(project.findings);
  const methods = lines(project.methods);
  const hasFindings = Boolean(findings && findings !== "<p></p>");
  const dates = [project.starts_on, project.ends_on].filter(Boolean).map((d) => formatDate(d, { month: "long", year: "numeric" }));

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-night pt-36 pb-16 text-white sm:pt-44 sm:pb-20">
        {project.cover_image?.src ? (
          <>
            <SmartImage image={project.cover_image} fallbackAlt="" fill priority sizes="100vw" className="-z-20 opacity-45" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/70 to-night/40" />
          </>
        ) : null}
        <div className="container-site">
          <Link href={back.href} className="label-mono inline-flex items-center gap-2 text-white/65 hover:text-white">
            <ArrowLeft className="size-3.5" aria-hidden="true" /> {back.label}
          </Link>
          <div className="mt-8">
            <StatusChip label={status.label} tone={status.tone} dark />
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.05] font-normal sm:text-6xl">{project.title}</h1>
          {project.summary ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">{project.summary}</p> : null}
        </div>
        {project.cover_image?.credit ? (
          <p className="absolute right-4 bottom-3 hidden max-w-xs text-right text-[10px] text-white/45 sm:block">Photo: {project.cover_image.credit}</p>
        ) : null}
      </header>

      <div className="bg-ivory py-16 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            {project.research_question ? (
              <section>
                <h2 className="label-mono text-earth">The question</h2>
                <p className="mt-4 border-l-2 border-gold pl-6 font-display text-3xl leading-snug text-forest italic sm:text-4xl">{project.research_question}</p>
              </section>
            ) : null}

            {description && description !== "<p></p>" ? (
              <div className="prose prose-lg prose-abc mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
            ) : null}

            {methods.length > 0 ? (
              <section className="mt-12 border-t border-forest/15 pt-10">
                <h2 className="label-mono text-earth">Method</h2>
                <ol className="mt-5 space-y-4">
                  {methods.map((m, i) => (
                    <li key={m} className="flex gap-5">
                      <span className="label-mono mt-1.5 w-6 shrink-0 text-charcoal/45">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-lg leading-relaxed text-charcoal/85">{m}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            <section className="mt-12 border-t border-forest/15 pt-10">
              <h2 className="label-mono text-earth">Findings</h2>
              {hasFindings ? (
                <div className="prose prose-lg prose-abc mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: findings }} />
              ) : (
                <p className="mt-4 flex items-start gap-2.5 text-charcoal/70">
                  <Info className="mt-1 size-4 shrink-0 text-earth" aria-hidden="true" />
                  {project.status === "completed"
                    ? "Findings have not been published yet."
                    : "There are no findings yet. Results will be published here once the work has been carried out and checked."}
                </p>
              )}
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-md bg-white p-6 ring-1 ring-forest/10 sm:p-8">
              <h2 className="label-mono text-charcoal/55">At a glance</h2>
              <dl className="mt-4 divide-y divide-forest/10">
                <div className="py-3">
                  <dt className="text-sm text-charcoal/60">Status</dt>
                  <dd className="mt-1 font-medium text-forest">{status.label}</dd>
                </div>
                {dates.length > 0 ? (
                  <div className="py-3">
                    <dt className="text-sm text-charcoal/60">Dates</dt>
                    <dd className="mt-1 font-medium text-forest">{dates.join(" to ")}</dd>
                  </div>
                ) : null}
                {lab ? (
                  <div className="py-3">
                    <dt className="text-sm text-charcoal/60">Nature Lab</dt>
                    <dd className="mt-1 font-medium text-forest">{lab.name}</dd>
                  </div>
                ) : null}
                {project.participation ? (
                  <div className="py-3">
                    <dt className="text-sm text-charcoal/60">Who takes part</dt>
                    <dd className="mt-1 leading-relaxed text-charcoal/85">{project.participation}</dd>
                  </div>
                ) : null}
              </dl>
              <Link href="/get-involved" className="mt-6 inline-flex h-11 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-evergreen">
                Get involved
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
