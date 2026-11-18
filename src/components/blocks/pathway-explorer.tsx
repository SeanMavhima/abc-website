"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type PathwayStep = { icon?: string; title?: string; text?: string; activities?: string; leads_to?: string };

/**
 * The research-to-action pathway as a cycle that visitors can step through.
 * Stages sit on a ring because the pathway does not end: sharing brings new
 * people in, and learning begins again.
 *
 * Built as a tab list, so it works with the arrow keys and screen readers.
 */
export function PathwayExplorer({ items, dark }: { items: PathwayStep[]; dark: boolean }) {
  const [active, setActive] = React.useState(0);
  const tabs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const id = React.useId();
  const n = items.length;
  const step = items[active];
  const next = items[(active + 1) % n];
  const activities = (step.activities ?? "").split("\n").map((s) => s.trim()).filter(Boolean);

  function select(i: number, focus = false) {
    const idx = (i + n) % n;
    setActive(idx);
    if (focus) tabs.current[idx]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      select(active + 1, true);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      select(active - 1, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      select(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      select(n - 1, true);
    }
  }

  const R = 42; // ring radius, as a percentage of the square
  const circumference = 2 * Math.PI * R;
  const line = dark ? "stroke-white/20" : "stroke-forest/15";

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
      {/* Ring */}
      <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" strokeWidth="0.35" strokeDasharray="0.6 1.4" className={line} />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            strokeWidth="0.7"
            strokeLinecap="round"
            className="stroke-gold transition-[stroke-dashoffset] duration-700 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - active / n)}
          />
        </svg>

        <div role="tablist" aria-label="Stages of the pathway" aria-orientation="horizontal" onKeyDown={onKeyDown}>
          {items.map((item, i) => {
            const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
            const Icon = getIcon(item.icon);
            const selected = i === active;
            return (
              <button
                key={`${item.title}-${i}`}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${id}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(i)}
                className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                style={{ left: `${50 + R * Math.cos(angle)}%`, top: `${50 + R * Math.sin(angle)}%` }}
              >
                <span
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full transition-all duration-300 sm:size-14",
                    selected
                      ? "scale-110 bg-gold text-night shadow-[0_0_0_6px_rgba(194,160,90,0.18)]"
                      : i < active
                        ? dark
                          ? "bg-evergreen text-gold ring-1 ring-gold/50 group-hover:ring-gold"
                          : "bg-white text-forest ring-1 ring-gold group-hover:bg-sand"
                        : dark
                          ? "bg-forest text-white/70 ring-1 ring-white/25 group-hover:text-white group-hover:ring-white/60"
                          : "bg-ivory text-forest/70 ring-1 ring-forest/20 group-hover:ring-forest/50",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className={cn("label-mono absolute top-full mt-2 whitespace-nowrap", selected ? "text-gold" : dark ? "text-white/60" : "text-charcoal/60")}>
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" aria-hidden="true">
          <span className={cn("label-mono", dark ? "text-white/50" : "text-charcoal/50")}>
            Stage {active + 1} of {n}
          </span>
          <span className={cn("mt-1 font-display text-4xl font-normal sm:text-5xl", dark ? "text-white" : "text-forest")}>{step.title}</span>
        </div>
      </div>

      {/* Panel */}
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} tabIndex={0} className="outline-offset-8">
        <div key={active} className="animate-fade-in">
          <p className="label-mono text-gold">
            {String(active + 1).padStart(2, "0")} · {step.title}
          </p>
          <p className={cn("mt-4 font-display text-2xl leading-snug font-normal sm:text-[2rem]", dark ? "text-white" : "text-forest")}>{step.text}</p>

          {activities.length > 0 ? (
            <div className="mt-8">
              <p className={cn("label-mono", dark ? "text-white/55" : "text-charcoal/55")}>What happens here</p>
              <ul className={cn("mt-3 divide-y border-y", dark ? "divide-white/10 border-white/10" : "divide-forest/10 border-forest/10")}>
                {activities.map((a) => (
                  <li key={a} className={cn("flex items-baseline gap-3 py-3 text-[1.02rem]", dark ? "text-white/85" : "text-charcoal/85")}>
                    <span className="size-1 shrink-0 -translate-y-1 rounded-full bg-gold" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {step.leads_to ? (
            <div className="mt-8">
              <p className={cn("label-mono", dark ? "text-white/55" : "text-charcoal/55")}>How it leads on</p>
              <p className={cn("mt-2 text-[1.02rem] leading-relaxed", dark ? "text-white/75" : "text-charcoal/75")}>{step.leads_to}</p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => select(active + 1)}
            className={cn(
              "group mt-8 inline-flex h-12 items-center gap-3 rounded-full px-6 text-[15px] font-semibold transition",
              dark ? "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white hover:text-forest" : "bg-forest text-white hover:bg-evergreen",
            )}
          >
            <span className="label-mono opacity-70">Next</span>
            {next.title}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
