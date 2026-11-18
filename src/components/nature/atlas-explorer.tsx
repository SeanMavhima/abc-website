"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Ecosystem, EcosystemZone, ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/site/smart-image";

export type AtlasSpecies = { slug: string; common_name: string; scientific_name: string; photo: ImageRef | null; ecosystem_id: string | null };

/**
 * The Living Atlas: an illustrative west-to-east cross-section of Rwanda's
 * landscapes. It is a drawing, not a map: nothing on it is a precise place,
 * which also means no sensitive location can be read from it.
 */

/* Outline of the land, as [x, y] in a 1000 x 360 drawing. One source for the shape and for placing symbols on it. */
const PROFILE: [number, number][] = [
  [0, 300], [80, 296], [160, 258], [215, 170], [290, 68], [345, 140], [400, 205], [440, 212], [480, 196], [520, 222],
  [550, 228], [590, 238], [630, 270], [710, 277], [790, 272], [850, 248], [900, 246], [950, 258], [1000, 270],
];

const ZONES: { zone: EcosystemZone; from: number; to: number; label: string }[] = [
  { zone: "lake", from: 0, to: 165, label: "Lake" },
  { zone: "montane_forest", from: 165, to: 400, label: "Mountain forest" },
  { zone: "hills", from: 400, to: 620, label: "Hills" },
  { zone: "wetland", from: 620, to: 790, label: "Wetland" },
  { zone: "savanna", from: 790, to: 1000, label: "Savanna" },
];

function yAt(x: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    const [x0, y0] = PROFILE[i - 1];
    const [x1, y1] = PROFILE[i];
    if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return PROFILE[PROFILE.length - 1][1];
}

/** A smooth line through the profile points. */
const LAND_PATH = (() => {
  let d = `M${PROFILE[0][0]},${PROFILE[0][1]}`;
  for (let i = 1; i < PROFILE.length - 1; i++) {
    const [x, y] = PROFILE[i];
    const [nx, ny] = PROFILE[i + 1];
    d += ` Q${x},${y} ${(x + nx) / 2},${(y + ny) / 2}`;
  }
  const [lx, ly] = PROFILE[PROFILE.length - 1];
  return `${d} L${lx},${ly}`;
})();

/* Height scale: 1,000 m sits at y = 320 and 3,000 m at y = 60. */
const elevationY = (m: number) => 320 - ((m - 1000) / 2000) * 260;

const TREES = [185, 200, 214, 228, 243, 258, 272, 305, 320, 334, 349, 364, 380];
const HILL_TREES = [432, 500, 565, 600];
const REEDS = [640, 652, 668, 684, 700, 716, 732, 748, 764, 776];
const ACACIAS = [812, 846, 884, 925];

export function AtlasExplorer({ ecosystems, species, dark = true }: { ecosystems: Ecosystem[]; species: AtlasSpecies[]; dark?: boolean }) {
  const [activeId, setActiveId] = React.useState(() => (ecosystems.find((e) => e.zone === "montane_forest") ?? ecosystems[0])?.id);
  const root = React.useRef<HTMLDivElement>(null);
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const id = React.useId();

  /* Links such as /explorer#wetlands-and-marshes open that habitat. */
  React.useEffect(() => {
    const open = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const match = ecosystems.find((e) => e.slug === slug);
      if (!match) return;
      setActiveId(match.id);
      root.current?.scrollIntoView({ block: "start" });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [ecosystems]);

  const active = ecosystems.find((e) => e.id === activeId) ?? ecosystems[0];
  if (!active) return null;
  const activeIndex = ecosystems.indexOf(active);
  const residents = species.filter((s) => s.ecosystem_id === active.id);
  const processes = active.processes.split("\n").map((s) => s.trim()).filter(Boolean);
  // Sanitised on the server by AtlasBlock before it reaches this component.
  const description = active.description;

  function onKeyDown(e: React.KeyboardEvent) {
    const move = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!move) return;
    e.preventDefault();
    const next = (activeIndex + move + ecosystems.length) % ecosystems.length;
    setActiveId(ecosystems[next].id);
    tabs.current[next]?.focus();
  }

  const ink = dark ? "text-white" : "text-forest";
  const soft = dark ? "text-white/60" : "text-charcoal/60";

  return (
    <div ref={root} className="scroll-mt-28">
      {/* Cross-section */}
      <div className="relative">
        <svg viewBox="0 0 1000 360" className="block h-auto w-full" role="img" aria-label="Illustrative cross-section of Rwanda from west to east: a lake, mountain forest, cultivated hills, wetland and savanna.">
          <defs>
            <linearGradient id={`${id}-land`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={dark ? "#3f7350" : "#2f5d40"} />
              <stop offset="1" stopColor={dark ? "#1b4234" : "#173d32"} />
            </linearGradient>
            <clipPath id={`${id}-clip`}>
              <path d={`${LAND_PATH} L1000,360 L0,360 Z`} />
            </clipPath>
          </defs>

          {/* Height scale */}
          {[1500, 2000, 2500, 3000].map((m) => (
            <g key={m}>
              <line x1="0" x2="1000" y1={elevationY(m)} y2={elevationY(m)} className={dark ? "stroke-white/10" : "stroke-forest/10"} strokeWidth="1" strokeDasharray="2 6" />
              <text x="996" y={elevationY(m) - 5} textAnchor="end" className={cn("fill-current font-mono text-[10px] tracking-wider", soft)}>
                {m.toLocaleString("en-GB")} m
              </text>
            </g>
          ))}

          {/* Lake */}
          <path d="M0,260 L166,260 L166,360 L0,360 Z" fill={dark ? "#3d7f8c" : "#5f9aa6"} opacity="0.75" />
          <path d="M8,268 h46 M70,274 h38 M22,282 h30 M96,266 h34" className="stroke-white/40" strokeWidth="1" strokeLinecap="round" fill="none" />

          {/* Land */}
          <path d={`${LAND_PATH} L1000,360 L0,360 Z`} fill={`url(#${id}-land)`} />

          {/* The selected habitat is lit */}
          {ZONES.map((z) =>
            z.zone === active.zone ? (
              <rect key={z.zone} x={z.from} y="0" width={z.to - z.from} height="360" fill="#c2a05a" opacity="0.5" clipPath={`url(#${id}-clip)`} className="animate-fade-in" />
            ) : null,
          )}

          {/* Wetland water and the eastern lakes */}
          <path d="M646,275 h44 M700,279 h52 M760,275 h20" stroke={dark ? "#8fc7d0" : "#bfe0e6"} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          <path d="M962,264 h38" stroke={dark ? "#8fc7d0" : "#bfe0e6"} strokeWidth="3" strokeLinecap="round" opacity="0.85" />

          {/* Vegetation */}
          <g className={dark ? "text-[#9cc79a]" : "text-[#cfe3c4]"} stroke="currentColor" fill="currentColor" strokeLinecap="round">
            {TREES.map((x, i) => {
              const y = yAt(x);
              const h = 13 + (i % 3) * 3;
              return (
                <g key={x}>
                  <line x1={x} x2={x} y1={y} y2={y - h} strokeWidth="1.2" />
                  <circle cx={x} cy={y - h - 4} r={5 + (i % 2)} stroke="none" />
                </g>
              );
            })}
            {HILL_TREES.map((x) => {
              const y = yAt(x);
              return (
                <g key={x}>
                  <line x1={x} x2={x} y1={y} y2={y - 10} strokeWidth="1.2" />
                  <circle cx={x} cy={y - 13} r="4.5" stroke="none" />
                </g>
              );
            })}
            {/* Terraced fields on the hills */}
            {[455, 470, 535, 580].map((x) => (
              <path key={x} d={`M${x - 9},${yAt(x) + 9} h18 M${x - 7},${yAt(x) + 15} h14`} strokeWidth="1" fill="none" opacity="0.6" />
            ))}
            {REEDS.map((x, i) => {
              const y = yAt(x);
              return <path key={x} d={`M${x},${y} l${-2 + (i % 3)},-${9 + (i % 4) * 2} M${x + 4},${y} l${1 + (i % 2)},-${7 + (i % 3) * 2}`} strokeWidth="1.1" fill="none" />;
            })}
            {ACACIAS.map((x) => {
              const y = yAt(x);
              return (
                <g key={x}>
                  <path d={`M${x},${y} v-13 M${x},${y - 9} l-6,-5 M${x},${y - 9} l6,-5`} strokeWidth="1.2" fill="none" />
                  <ellipse cx={x} cy={y - 16} rx="12" ry="3.2" stroke="none" />
                </g>
              );
            })}
          </g>

          {/* Compass */}
          <text x="4" y="352" className={cn("fill-current font-mono text-[10px] tracking-[0.2em]", soft)}>
            WEST
          </text>
          <text x="996" y="352" textAnchor="end" className={cn("fill-current font-mono text-[10px] tracking-[0.2em]", soft)}>
            EAST
          </text>

          {/* Click targets for the mouse; the buttons below serve the keyboard and screen readers */}
          {ZONES.map((z) => {
            const eco = ecosystems.find((e) => e.zone === z.zone);
            if (!eco) return null;
            return (
              <rect
                key={z.zone}
                x={z.from}
                y="0"
                width={z.to - z.from}
                height="360"
                fill="transparent"
                className="cursor-pointer hover:fill-white/5"
                onClick={() => setActiveId(eco.id)}
                aria-hidden="true"
              />
            );
          })}
        </svg>
        <p className={cn("label-mono mt-2 text-right normal-case", soft)}>Illustrative cross-section. Not to scale.</p>
      </div>

      {/* Habitat tabs */}
      <div role="tablist" aria-label="Habitats" onKeyDown={onKeyDown} className={cn("mt-4 flex gap-px overflow-x-auto border-y", dark ? "border-white/15" : "border-forest/15")}>
        {ecosystems.map((e, i) => {
          const selected = e.id === active.id;
          return (
            <button
              key={e.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(e.id)}
              className={cn(
                "group relative min-w-[9.5rem] flex-1 px-4 py-4 text-left transition-colors",
                selected ? (dark ? "bg-white/8" : "bg-forest/5") : dark ? "hover:bg-white/5" : "hover:bg-forest/5",
              )}
            >
              <span className={cn("absolute inset-x-0 top-0 h-0.5 transition-colors", selected ? "bg-gold" : "bg-transparent")} aria-hidden="true" />
              <span className={cn("label-mono block", selected ? "text-gold" : soft)}>{e.elevation || `Habitat ${i + 1}`}</span>
              <span className={cn("mt-1 block font-display text-lg leading-tight font-medium", selected ? ink : dark ? "text-white/75" : "text-forest/75")}>{e.name}</span>
            </button>
          );
        })}
      </div>

      {/* Habitat panel */}
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${activeIndex}`} tabIndex={0} className="mt-10 outline-offset-8 sm:mt-14">
        <div key={active.id} id={active.slug} className="grid animate-fade-in gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h3 className={cn("font-display text-3xl leading-tight font-normal sm:text-4xl", ink)}>{active.name}</h3>
            {active.summary ? <p className={cn("mt-4 text-xl leading-relaxed", dark ? "text-white/85" : "text-charcoal/85")}>{active.summary}</p> : null}
            {description ? (
              <div className={cn("prose prose-abc mt-5 max-w-none", dark && "prose-invert-abc")} dangerouslySetInnerHTML={{ __html: description }} />
            ) : null}

            <dl className={cn("mt-8 grid gap-x-10 gap-y-6 border-t pt-6 sm:grid-cols-2", dark ? "border-white/15" : "border-forest/15")}>
              {processes.length > 0 ? (
                <div>
                  <dt className={cn("label-mono", soft)}>How it works</dt>
                  <dd className="mt-2">
                    <ul className={cn("space-y-1.5 text-[0.95rem]", dark ? "text-white/80" : "text-charcoal/80")}>
                      {processes.map((p) => (
                        <li key={p} className="flex items-baseline gap-2.5">
                          <span className="size-1 shrink-0 -translate-y-1 rounded-full bg-gold" aria-hidden="true" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
              {active.example_places ? (
                <div>
                  <dt className={cn("label-mono", soft)}>Where to find it</dt>
                  <dd className={cn("mt-2 text-[0.95rem]", dark ? "text-white/80" : "text-charcoal/80")}>{active.example_places}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="lg:col-span-5">
            {active.photo?.src ? (
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                  <SmartImage image={active.photo} fallbackAlt={active.name} fill sizes="(min-width: 1024px) 40vw, 100vw" />
                </div>
                {active.photo.credit ? <figcaption className={cn("mt-2 text-[11px]", soft)}>Photo: {active.photo.credit}</figcaption> : null}
              </figure>
            ) : null}

            <div className="mt-8">
              <p className={cn("label-mono", soft)}>Who lives here</p>
              {residents.length > 0 ? (
                <ul className={cn("mt-3 divide-y border-y", dark ? "divide-white/10 border-white/10" : "divide-forest/10 border-forest/10")}>
                  {residents.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/explorer/${s.slug}`} className="group flex items-center gap-4 py-3">
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-evergreen">
                          {s.photo?.src ? <SmartImage image={s.photo} fallbackAlt="" fill sizes="48px" /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn("block font-medium", ink)}>{s.common_name}</span>
                          {s.scientific_name ? <span className={cn("sci-name block text-sm", soft)}>{s.scientific_name}</span> : null}
                        </span>
                        <ArrowRight className={cn("size-4 transition-transform group-hover:translate-x-1", dark ? "text-gold" : "text-earth")} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={cn("mt-3 text-sm", soft)}>No species entries have been added for this habitat yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
