"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ImagePlaceholder, SmartImage } from "@/components/site/smart-image";
import { IucnChip } from "@/components/site/status-chip";
import { NotebookButton } from "./notebook";

/** Only the fields the cards need, so the page ships no more data than it shows. */
export type SpeciesCardData = {
  slug: string;
  common_name: string;
  scientific_name: string;
  local_name: string;
  summary: string;
  photo: ImageRef | null;
  conservation_status: string;
  entry_type: "reference" | "abc_observation";
  category: { slug: string; name: string } | null;
  ecosystem: { slug: string; name: string } | null;
};

export function SpeciesCard({ species }: { species: SpeciesCardData }) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-forest">
        {species.photo?.src ? (
          <SmartImage
            image={species.photo}
            fallbackAlt={species.common_name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-[1600ms] ease-out group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        {species.conservation_status ? (
          <div className="absolute top-3 left-3">
            <IucnChip code={species.conservation_status} dark compact />
          </div>
        ) : null}
        <div className="absolute right-3 bottom-3 z-10">
          <NotebookButton entry={{ slug: species.slug, common_name: species.common_name, scientific_name: species.scientific_name, photo: species.photo }} />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 pr-16 text-white">
          {species.category ? <p className="label-mono text-white/75">{species.category.name}</p> : null}
        </div>
      </div>
      <div className="pt-4">
        <h3 className="font-display text-2xl leading-tight font-medium text-forest">
          <Link href={`/explorer/${species.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:text-evergreen">
            {species.common_name}
          </Link>
        </h3>
        {species.scientific_name ? <p className="sci-name mt-0.5 text-charcoal/65">{species.scientific_name}</p> : null}
        <p className="mt-2 text-[0.95rem] leading-relaxed text-charcoal/70">{species.summary}</p>
        {species.entry_type === "abc_observation" ? <p className="label-mono mt-3 text-earth">ABC field observation</p> : null}
      </div>
    </article>
  );
}

type Option = { slug: string; name: string };

export function SpeciesExplorer({ species, categories, ecosystems }: { species: SpeciesCardData[]; categories: Option[]; ecosystems: Option[] }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [ecosystem, setEcosystem] = React.useState("");

  const q = query.trim().toLowerCase();
  const results = species.filter(
    (s) =>
      (!category || s.category?.slug === category) &&
      (!ecosystem || s.ecosystem?.slug === ecosystem) &&
      (!q || `${s.common_name} ${s.scientific_name} ${s.local_name} ${s.summary}`.toLowerCase().includes(q)),
  );
  const filtered = Boolean(q || category || ecosystem);

  const chip = (selected: boolean) =>
    cn(
      "label-mono rounded-full px-4 py-2.5 transition",
      selected ? "bg-forest text-white" : "bg-white text-charcoal/75 ring-1 ring-forest/15 hover:ring-forest/40",
    );

  return (
    <div>
      <div className="flex flex-col gap-5 border-y border-forest/15 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by group">
          <button type="button" className={chip(category === "")} aria-pressed={category === ""} onClick={() => setCategory("")}>
            All groups
          </button>
          {categories.map((c) => (
            <button key={c.slug} type="button" className={chip(category === c.slug)} aria-pressed={category === c.slug} onClick={() => setCategory(c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block">
            <span className="sr-only">Filter by habitat</span>
            <select
              value={ecosystem}
              onChange={(e) => setEcosystem(e.target.value)}
              className="h-11 w-full appearance-none rounded-full bg-white px-5 pr-10 text-sm text-charcoal ring-1 ring-forest/15 hover:ring-forest/40 sm:w-56"
            >
              <option value="">All habitats</option>
              {ecosystems.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-charcoal/50" aria-hidden="true">
              ▾
            </span>
          </label>
          <label className="relative block">
            <span className="sr-only">Search species</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-charcoal/50" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name"
              className="h-11 w-full rounded-full bg-white pr-4 pl-11 text-sm text-charcoal ring-1 ring-forest/15 placeholder:text-charcoal/45 hover:ring-forest/40 sm:w-60"
            />
          </label>
        </div>
      </div>

      <p className="label-mono mt-5 text-charcoal/60" role="status" aria-live="polite">
        {results.length} {results.length === 1 ? "entry" : "entries"}
        {filtered ? " match" : ""}
      </p>

      {results.length > 0 ? (
        <ul className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((s) => (
            <li key={s.slug}>
              <SpeciesCard species={s} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-md border border-dashed border-forest/25 px-6 py-16 text-center">
          <p className="font-display text-2xl text-forest">Nothing matches those filters</p>
          <p className="mt-2 text-charcoal/65">Try a different name, group or habitat.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("");
              setEcosystem("");
            }}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-evergreen"
          >
            <X className="size-4" aria-hidden="true" /> Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
