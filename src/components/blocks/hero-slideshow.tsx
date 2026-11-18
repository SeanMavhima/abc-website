"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Pause, Play } from "lucide-react";
import type { ImageRef, LinkRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/components/site/motion-provider";
import { SmartLink } from "@/components/site/smart-link";

export type HeroData = {
  eyebrow: string;
  headline: string;
  text: string;
  primary: LinkRef;
  secondary: LinkRef;
  mode: "slideshow" | "static";
  interval: number;
  slides: { image: ImageRef }[];
};

/* Each slide drifts in a slightly different direction for variety. */
const DRIFTS = [
  { x: "-2%", y: "-1%" },
  { x: "2%", y: "-1.5%" },
  { x: "-1.5%", y: "1%" },
  { x: "1.5%", y: "1.5%" },
  { x: "0%", y: "-2%" },
];

const TRANSITION_MS = 1800;

export function HeroSlideshow({ data }: { data: HeroData }) {
  const { reduced } = useMotionPreference();
  const slides = data.slides;
  const isSlideshow = data.mode === "slideshow" && slides.length > 1;
  const intervalMs = Math.min(20, Math.max(4, data.interval || 8)) * 1000;

  const [active, setActive] = React.useState(0);
  const [previous, setPrevious] = React.useState<number | null>(null);
  const [playing, setPlaying] = React.useState(true);
  const [cycle, setCycle] = React.useState(0);
  // Slides are mounted lazily: the first immediately, the next one ahead of time.
  const [mounted, setMounted] = React.useState<Set<number>>(() => new Set([0]));
  const activeRef = React.useRef(0);

  const autoplay = isSlideshow && playing && !reduced;

  const goTo = React.useCallback((next: number) => {
    const current = activeRef.current;
    if (next === current) return;
    activeRef.current = next;
    setPrevious(current);
    setActive(next);
    setCycle((c) => c + 1);
  }, []);

  React.useEffect(() => {
    if (!isSlideshow) return;
    const t = window.setTimeout(
      () =>
        setMounted((prev) => {
          const nextIdx = (active + 1) % slides.length;
          if (prev.has(active) && prev.has(nextIdx)) return prev;
          return new Set([...prev, active, nextIdx]);
        }),
      active === 0 ? 1500 : 0,
    );
    return () => window.clearTimeout(t);
  }, [active, isSlideshow, slides.length]);

  React.useEffect(() => {
    if (!autoplay) return;
    const t = window.setTimeout(() => goTo((active + 1) % slides.length), intervalMs);
    return () => window.clearTimeout(t);
  }, [autoplay, active, cycle, intervalMs, slides.length, goTo]);

  // Release the previous slide once the crossfade has finished.
  React.useEffect(() => {
    if (previous === null) return;
    const t = window.setTimeout(() => setPrevious(null), TRANSITION_MS + 100);
    return () => window.clearTimeout(t);
  }, [previous, cycle]);

  const words = data.headline.split(" ").filter(Boolean);
  const current = slides[active]?.image;

  return (
    <section
      aria-roledescription={isSlideshow ? "carousel" : undefined}
      aria-label="Introduction"
      className="relative isolate flex h-[100svh] min-h-[620px] items-end overflow-hidden bg-forest text-white"
    >
      {/* Slides */}
      <div className="absolute inset-0 -z-20" aria-live={autoplay ? "off" : "polite"}>
        {slides.map((slide, i) => {
          const isActive = i === active;
          const isPrev = i === previous;
          const drift = DRIFTS[i % DRIFTS.length];
          const visible = isSlideshow ? isActive || isPrev : i === 0;
          return (
            <div
              key={`${slide.image.src}-${i}`}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 overflow-hidden",
                isActive ? "z-20" : isPrev ? "z-10" : "z-0",
                visible ? "opacity-100" : "opacity-0",
                isActive && !reduced && "transition-opacity ease-in-out",
              )}
              style={{ transitionDuration: `${TRANSITION_MS}ms` }}
            >
              <div
                className="absolute inset-0 will-change-transform"
                style={
                  !reduced && (isActive || isPrev)
                    ? ({
                        animation: `abc-kenburns ${intervalMs + TRANSITION_MS * 2}ms ease-out forwards`,
                        "--kb-x": drift.x,
                        "--kb-y": drift.y,
                      } as React.CSSProperties)
                    : undefined
                }
              >
                {mounted.has(i) || isActive ? (
                  <Image
                    src={slide.image.src}
                    alt={slide.image.alt}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    quality={80}
                    className="object-cover"
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contrast overlays */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />

      <div className="container-site relative pb-28 sm:pb-32 lg:pb-36">
        <div className="max-w-4xl">
          {data.eyebrow ? (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="eyebrow flex items-center gap-3 text-sage"
            >
              <span className="h-px w-10 bg-sage/70" aria-hidden="true" />
              {data.eyebrow}
            </motion.p>
          ) : null}

          <h1 className="mt-6 font-display text-[clamp(2.6rem,7.2vw,6.25rem)] leading-[0.98] font-medium tracking-[-0.035em]">
            {words.map((word, i) => (
              <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, delay: 0.35 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                >
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </h1>

          {data.text ? (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl"
            >
              {data.text}
            </motion.p>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            {data.primary?.label && data.primary?.href ? (
              <SmartLink
                href={data.primary.href}
                className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-forest shadow-lg shadow-black/20 transition hover:bg-sage"
              >
                {data.primary.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </SmartLink>
            ) : null}
            {data.secondary?.label && data.secondary?.href ? (
              <SmartLink
                href={data.secondary.href}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold text-white ring-1 ring-white/45 backdrop-blur-sm transition hover:bg-white/10 hover:ring-white"
              >
                {data.secondary.label}
              </SmartLink>
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="container-site flex items-end justify-between gap-6 pb-6 sm:pb-8">
          <div className="flex items-center gap-4">
            {isSlideshow ? (
              <>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  disabled={reduced}
                  className="flex size-10 items-center justify-center rounded-full text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white/15 disabled:opacity-40"
                  aria-label={autoplay ? "Pause slideshow" : "Play slideshow"}
                  title={reduced ? "Autoplay is off because reduced motion is enabled" : undefined}
                >
                  {autoplay ? <Pause className="size-4" /> : <Play className="size-4" />}
                </button>
                <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
                  {slides.map((s, i) => (
                    <button
                      key={`dot-${i}`}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Show slide ${i + 1} of ${slides.length}`}
                      aria-current={i === active}
                      className="group relative h-10 w-8 sm:w-12"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/30">
                        {i === active ? (
                          <span
                            key={`p-${cycle}`}
                            className="absolute inset-0 origin-left rounded-full bg-white"
                            style={
                              autoplay
                                ? { animation: `abc-progress ${intervalMs}ms linear forwards` }
                                : { transform: "scaleX(1)" }
                            }
                          />
                        ) : null}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="hidden font-display text-xs font-medium tracking-widest text-white/70 tabular-nums sm:block">
                  {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </p>
              </>
            ) : null}
          </div>

          <div className="flex items-end gap-6">
            {current?.credit ? (
              <p className="hidden max-w-[16rem] text-right text-[10px] leading-snug text-white/50 md:block">
                Photo: {current.credit}
              </p>
            ) : null}
            <a
              href="#content"
              className="hidden flex-col items-center gap-2 text-[10px] font-semibold tracking-[0.25em] text-white/70 uppercase hover:text-white sm:flex"
            >
              Scroll
              <span className="relative h-10 w-px overflow-hidden bg-white/25">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[abc-scroll_2.2s_ease-in-out_infinite] bg-white" />
              </span>
              <ArrowDown className="sr-only" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
