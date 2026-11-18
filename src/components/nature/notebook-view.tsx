"use client";

import Link from "next/link";
import { ArrowRight, Printer, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SmartImage } from "@/components/site/smart-image";
import { useNotebook } from "./notebook";

/** The visitor's saved species and notes. Everything here stays in their browser. */
export function NotebookView() {
  const { entries, loaded, setNote, remove, clear } = useNotebook();

  return (
    <div className="bg-ivory pt-32 pb-24 sm:pt-40">
      <div className="container-site max-w-4xl">
        <p className="eyebrow text-earth">Biodiversity Explorer</p>
        <h1 className="mt-4 font-display text-5xl font-normal text-forest sm:text-6xl">My field notebook</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-charcoal/75">
          Species you have saved, with space for your own notes. Your notebook is stored only in this browser on this device. Nothing is sent to ABC.
        </p>

        {!loaded ? (
          <p className="mt-14 text-charcoal/60" role="status">
            Opening your notebook…
          </p>
        ) : entries.length === 0 ? (
          <div className="mt-14 rounded-md border border-dashed border-forest/25 px-6 py-16 text-center">
            <p className="font-display text-2xl text-forest">Your notebook is empty</p>
            <p className="mx-auto mt-2 max-w-md text-charcoal/65">Save species from the Biodiversity Explorer and they will appear here.</p>
            <Link href="/explorer#species" className="group mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-forest px-6 text-[15px] font-semibold text-white hover:bg-evergreen">
              Explore species
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <>
            <div className="no-print mt-10 flex flex-wrap items-center justify-between gap-3 border-y border-forest/15 py-4">
              <p className="label-mono text-charcoal/60">
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-white hover:bg-evergreen">
                  <Printer className="size-4" aria-hidden="true" /> Print field guide
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove every entry and note from your notebook? This cannot be undone.")) clear();
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-charcoal/70 ring-1 ring-forest/20 hover:text-destructive hover:ring-destructive/40"
                >
                  <Trash2 className="size-4" aria-hidden="true" /> Clear all
                </button>
              </div>
            </div>
            <ul className="divide-y divide-forest/15">
              {entries.map((e) => (
                <li key={e.slug} className="grid gap-5 py-8 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-forest sm:aspect-square">
                    {e.photo?.src ? <SmartImage image={e.photo} fallbackAlt={e.common_name} fill sizes="160px" /> : null}
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-2xl font-medium text-forest">
                          <Link href={`/explorer/${e.slug}`} className="hover:text-evergreen">
                            {e.common_name}
                          </Link>
                        </h2>
                        {e.scientific_name ? <p className="sci-name text-charcoal/65">{e.scientific_name}</p> : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(e.slug)}
                        aria-label={`Remove ${e.common_name} from your notebook`}
                        className="no-print flex size-9 shrink-0 items-center justify-center rounded-full text-charcoal/50 hover:bg-forest/5 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <label className="mt-4 block">
                      <span className="label-mono text-charcoal/55">My notes</span>
                      <textarea
                        rows={3}
                        defaultValue={e.note}
                        onBlur={(ev) => setNote(e.slug, ev.target.value)}
                        placeholder="Where and when did you see it? What was it doing?"
                        className="mt-2 block w-full rounded-sm border border-forest/15 bg-white px-3.5 py-2.5 text-[0.95rem] text-charcoal placeholder:text-charcoal/40 focus:border-evergreen focus:outline-none"
                      />
                    </label>
                    <p className="label-mono mt-2 text-charcoal/45">Saved {formatDate(e.savedAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
