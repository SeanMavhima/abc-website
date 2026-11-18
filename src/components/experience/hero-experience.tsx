"use client";

/**
 * Homepage opening.
 *
 * Where the device allows, visitors travel through a procedural 3D landscape
 * as they scroll: from above the forest, down the valley, to the water's
 * edge. Everywhere else (no WebGL, reduced motion, low-power devices, the
 * visitor's own "3D off" switch, or 3D disabled in the CMS) the photographic
 * slideshow is shown instead. The text is server-rendered either way.
 */
import * as React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowDown, ArrowRight, Box, Volume2, VolumeX, X } from "lucide-react";
import type { LinkRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/components/site/motion-provider";
import { SmartLink } from "@/components/site/smart-link";
import { HeroSlideshow, type HeroData } from "@/components/blocks/hero-slideshow";
import { createSoundscape, type Soundscape } from "./soundscape";
import { detectCapability, hasWebGL, markStruggled, useImmersivePreference } from "./use-immersive";
import { resolveTheme, type Quality, type ThemeName, type ThemeSetting, type Zone } from "./world";

const Scene = dynamic(() => import("./scene"), { ssr: false });

export type Chapter = { title: string; text: string };
export type Hotspot = { title: string; text: string; zone: Zone; link: LinkRef };

export type HeroExperienceData = HeroData & {
  experience: "3d" | "photo";
  theme: ThemeSetting;
  sound: boolean;
  chapters: Chapter[];
  hotspots: Hotspot[];
};

type Mode = "pending" | "3d" | "photo";

export function HeroExperience({ data }: { data: HeroExperienceData }) {
  const { reduced } = useMotionPreference();
  const { choice, setEnabled } = useImmersivePreference();
  const wants3d = data.experience === "3d";

  const [mode, setMode] = React.useState<Mode>(wants3d ? "pending" : "photo");
  const [quality, setQuality] = React.useState<Quality>("low");
  const [capable, setCapable] = React.useState(false);
  const [theme, setTheme] = React.useState<ThemeName>(data.theme === "auto" ? "day" : data.theme);
  const [ready, setReady] = React.useState(false);
  const [active, setActive] = React.useState(true);
  const [stage, setStage] = React.useState(0);
  const [openSpot, setOpenSpot] = React.useState<number | null>(null);
  const [soundOn, setSoundOn] = React.useState(false);

  const trackRef = React.useRef<HTMLElement>(null);
  const progress = React.useRef(0);
  const pointer = React.useRef({ x: 0, y: 0 });
  const markers = React.useRef<(HTMLElement | null)[]>([]);
  const sound = React.useRef<Soundscape | null>(null);

  const chapters = data.chapters.filter((c) => c.title || c.text);
  const hotspots = data.hotspots.filter((h) => h.title);
  const stages = chapters.length + 1;
  const zones = React.useMemo(() => hotspots.map((h) => h.zone), [hotspots.map((h) => h.zone).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Decide between the 3D landscape and photographs */
  React.useEffect(() => {
    if (!wants3d) return setMode("photo");
    const webgl = hasWebGL();
    setCapable(webgl);
    if (!webgl || choice === "off") return setMode("photo");
    const capability = detectCapability();
    // Left to itself, the site shows photographs for reduced motion or a modest device.
    // A visitor who asks for 3D gets it anyway, in the lighter version if need be.
    if (choice === "auto" && (reduced || capability === "none")) return setMode("photo");
    setQuality(capability === "none" ? "low" : capability);
    setTheme(resolveTheme(data.theme));
    setMode("3d");
  }, [wants3d, reduced, choice, data.theme]);

  /* Scroll position drives the camera and the chapter text */
  React.useEffect(() => {
    if (mode !== "3d") return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = trackRef.current;
      if (!el) return;
      const travel = el.offsetHeight - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel)) : 0;
      progress.current = p;
      sound.current?.setProgress(p);
      setStage(Math.min(stages - 1, Math.floor(p * stages * 0.999)));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [mode, stages]);

  /* Stop drawing (and stop sound) when the hero is off screen */
  React.useEffect(() => {
    const el = trackRef.current;
    if (mode !== "3d" || !el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  React.useEffect(() => {
    if (!active && soundOn) {
      sound.current?.stop();
      setSoundOn(false);
    }
  }, [active, soundOn]);

  React.useEffect(() => () => sound.current?.dispose(), []);

  React.useEffect(() => {
    if (openSpot === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenSpot(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openSpot]);

  const onStruggle = React.useCallback(() => {
    markStruggled();
    // Switch to photographs, and leave the "Turn on 3D" button for anyone who wants to try again.
    setEnabled(false);
  }, [setEnabled]);
  const onReady = React.useCallback(() => setReady(true), []);

  async function toggleSound() {
    if (soundOn) {
      sound.current?.stop();
      setSoundOn(false);
      return;
    }
    sound.current ??= createSoundscape(theme === "dusk");
    if (!sound.current) return;
    await sound.current.start();
    sound.current.setProgress(progress.current);
    setSoundOn(true);
  }

  function goToStage(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (travel * (i + 0.5)) / stages, behavior: "smooth" });
  }

  if (mode === "photo") {
    return (
      <div className="relative">
        <HeroSlideshow data={data} />
        {wants3d && capable ? (
          <button
            type="button"
            onClick={() => setEnabled(true)}
            className="label-mono absolute top-24 right-4 z-30 inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-forest shadow-lg shadow-black/25 transition hover:bg-sand sm:top-28 sm:right-8 lg:right-12"
          >
            <Box className="size-4" aria-hidden="true" /> Turn on 3D landscape
          </button>
        ) : null}
      </div>
    );
  }

  const poster = data.slides[0]?.image;
  const is3d = mode === "3d";
  const spot = openSpot === null ? null : hotspots[openSpot];

  return (
    <section
      ref={trackRef}
      aria-label="Introduction"
      data-hero-track
      className="relative bg-night"
      style={{ height: is3d ? `calc(100svh + ${(stages - 1) * 95 + 40}svh)` : "100svh" }}
    >
      <div
        className="sticky top-0 isolate flex h-[100svh] min-h-[600px] items-end overflow-hidden text-white"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
          pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        }}
      >
        {/* Poster: shown immediately, and behind the landscape until its first frame is drawn */}
        <div className="absolute inset-0 -z-30">
          {poster ? <Image src={poster.src} alt="" fill priority sizes="100vw" quality={70} className="object-cover" /> : null}
          <div className="absolute inset-0 bg-night/55" />
        </div>

        {is3d ? (
          <div className={cn("absolute inset-0 -z-20 transition-opacity duration-[1400ms] ease-out", ready ? "opacity-100" : "opacity-0")}>
            <Scene
              theme={theme}
              quality={quality}
              active={active}
              progress={progress}
              pointer={pointer}
              zones={zones}
              markers={markers}
              onReady={onReady}
              onStruggle={onStruggle}
            />
          </div>
        ) : null}

        {/* Contrast for the text */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black/45 via-transparent to-transparent" />

        {/* Information points, positioned by the scene every frame */}
        {is3d
          ? hotspots.map((h, i) => (
              <div
                key={`${h.title}-${i}`}
                ref={(el) => {
                  markers.current[i] = el;
                }}
                className="absolute top-0 left-0 z-10 transition-opacity duration-300"
                style={{ visibility: "hidden", opacity: 0 }}
              >
                <button
                  type="button"
                  onClick={() => setOpenSpot(openSpot === i ? null : i)}
                  aria-expanded={openSpot === i}
                  aria-label={`About: ${h.title}`}
                  className="group relative flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                >
                  <span className="abc-pulse absolute size-5 animate-[abc-pulse_2.6s_ease-out_infinite] rounded-full ring-1 ring-gold" aria-hidden="true" />
                  <span
                    className={cn(
                      "relative size-3 rounded-full ring-2 ring-white/90 transition-transform group-hover:scale-125 group-focus-visible:scale-125",
                      openSpot === i ? "bg-white" : "bg-gold",
                    )}
                    aria-hidden="true"
                  />
                  <span className="label-mono pointer-events-none absolute top-full left-1/2 mt-0.5 -translate-x-1/2 rounded-sm bg-black/55 px-2 py-1 whitespace-nowrap text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {h.title}
                  </span>
                </button>
              </div>
            ))
          : null}

        {/* Information panel */}
        {spot ? (
          <div
            role="dialog"
            aria-label={spot.title}
            className="absolute inset-x-4 bottom-24 z-30 animate-fade-in rounded-md border border-white/15 bg-night/85 p-5 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-8 sm:bottom-28 sm:w-[22rem] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="label-mono text-gold">Information point</p>
              <button
                type="button"
                onClick={() => setOpenSpot(null)}
                className="-mt-1.5 -mr-1.5 flex size-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <h2 className="mt-2 font-display text-2xl font-medium">{spot.title}</h2>
            {spot.text ? <p className="mt-2 text-[0.95rem] leading-relaxed text-white/80">{spot.text}</p> : null}
            {spot.link?.label && spot.link?.href ? (
              <SmartLink href={spot.link.href} className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sage hover:text-white">
                {spot.link.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </SmartLink>
            ) : null}
          </div>
        ) : null}

        {/* Text: the introduction, then one chapter at a time */}
        <div className="container-site relative w-full pb-28 sm:pb-32">
          <div className="grid max-w-4xl [&>*]:col-start-1 [&>*]:row-start-1">
            <Stage active={!is3d || stage === 0} hasLinks>
              {data.eyebrow ? (
                <p className="eyebrow flex items-center gap-3 text-sage">
                  <span className="h-px w-10 bg-sage/70" aria-hidden="true" />
                  {data.eyebrow}
                </p>
              ) : null}
              <h1 className="mt-6 font-display text-[clamp(2.9rem,8vw,7rem)] leading-[0.95] font-normal tracking-[-0.03em]">{data.headline}</h1>
              {data.text ? <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">{data.text}</p> : null}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                {data.primary?.label && data.primary?.href ? (
                  <SmartLink
                    href={data.primary.href}
                    className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-forest shadow-lg shadow-black/20 transition hover:bg-sand"
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
              </div>
            </Stage>
            {is3d
              ? chapters.map((c, i) => (
                  <Stage key={`${c.title}-${i}`} active={stage === i + 1}>
                    <p className="label-mono text-gold">
                      {String(i + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}
                    </p>
                    <h2 className="mt-5 font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] font-normal tracking-[-0.03em]">{c.title}</h2>
                    {c.text ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">{c.text}</p> : null}
                  </Stage>
                ))
              : null}
          </div>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-0 z-20">
          <div className="container-site flex items-center justify-between gap-4 pb-6 sm:pb-8">
            <div className="flex items-center gap-2">
              {is3d && stages > 1 ? (
                <div className="mr-2 flex items-center" role="group" aria-label="Chapters">
                  {Array.from({ length: stages }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToStage(i)}
                      aria-label={i === 0 ? "Go to the introduction" : `Go to chapter ${i}: ${chapters[i - 1]?.title ?? ""}`}
                      aria-current={stage === i ? "step" : undefined}
                      className="group flex h-10 w-7 items-center sm:w-10"
                    >
                      <span className={cn("h-[3px] w-full rounded-full transition-colors", stage === i ? "bg-white" : "bg-white/30 group-hover:bg-white/60")} />
                    </button>
                  ))}
                </div>
              ) : null}
              {is3d && data.sound ? (
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-pressed={soundOn}
                  className="flex h-10 items-center gap-2 rounded-full px-3 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/15"
                >
                  {soundOn ? <Volume2 className="size-4" aria-hidden="true" /> : <VolumeX className="size-4" aria-hidden="true" />}
                  <span className="label-mono hidden sm:inline">{soundOn ? "Sound on" : "Sound off"}</span>
                  <span className="sr-only sm:hidden">{soundOn ? "Turn ambient sound off" : "Turn ambient sound on"}</span>
                </button>
              ) : null}
              {is3d ? (
                <button
                  type="button"
                  onClick={() => setEnabled(false)}
                  className="flex h-10 items-center gap-2 rounded-full bg-black/25 px-3.5 text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white hover:text-forest"
                  title="Show photographs instead of the 3D landscape"
                  aria-label="Turn off the 3D landscape"
                >
                  <Box className="size-4" aria-hidden="true" />
                  <span className="label-mono whitespace-nowrap">3D off</span>
                </button>
              ) : null}
            </div>
            <a
              href="#content"
              className="label-mono group inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-white ring-1 ring-white/35 backdrop-blur transition hover:bg-white hover:text-forest"
            >
              {is3d ? (
                <>
                  Skip<span className="hidden sm:inline">&nbsp;to the site</span>
                </>
              ) : (
                "Scroll"
              )}
              <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {poster?.credit && !ready ? (
          <p className="absolute top-24 right-4 hidden max-w-[14rem] text-right text-[10px] leading-snug text-white/45 md:block">Photo: {poster.credit}</p>
        ) : null}
      </div>

      {/* The same information for people who do not use the visual markers */}
      {is3d && hotspots.length > 0 ? (
        <div className="sr-only">
          <h2>Places in the landscape</h2>
          <dl>
            {hotspots.map((h, i) => (
              <div key={i}>
                <dt>{h.title}</dt>
                <dd>{h.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}

function Stage({ active, hasLinks = false, children }: { active: boolean; hasLinks?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "self-end transition-[opacity,transform] duration-700 ease-out",
        active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
      // Hidden chapters stay readable by screen readers; only a stage with links is made inert, so focus cannot land on something invisible.
      inert={!active && hasLinks}
    >
      {children}
    </div>
  );
}
