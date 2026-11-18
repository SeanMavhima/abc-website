import type { ImageRef, LinkRef } from "@/lib/types";
import { cn, str } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";
import { SmartImage } from "@/components/site/smart-image";
import { ArrowLink, RichText, StatusPill, bgClass, hasLink } from "./shared";

export function ImageTextBlock({ data }: { data: Record<string, unknown> }) {
  const image = data.image as ImageRef | null;
  const link = data.link as LinkRef | undefined;
  const variant = str(data.variant, "light");
  const imageLeft = str(data.image_position, "right") === "left";
  const eyebrow = str(data.eyebrow);
  const heading = str(data.heading);
  const badge = str(data.badge);
  const anchor = str(data.anchor);

  if (variant === "feature") {
    return (
      <section id={anchor || undefined} className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-forest py-24 text-white">
        {image?.src ? (
          <>
            <SmartImage image={image} fill sizes="100vw" className="-z-20" />
            <div
              className={cn(
                "absolute inset-0 -z-10",
                imageLeft
                  ? "bg-gradient-to-l from-forest/95 via-forest/70 to-forest/10"
                  : "bg-gradient-to-r from-forest/95 via-forest/70 to-forest/10",
              )}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest/60 to-transparent" />
          </>
        ) : null}
        <div className="container-site">
          <Reveal className={cn("max-w-xl", imageLeft && "ml-auto")}>
            {badge ? <StatusPill dark>{badge}</StatusPill> : null}
            {eyebrow ? <p className="eyebrow mt-6 text-sage">{eyebrow}</p> : null}
            {heading ? (
              <h2 className="mt-4 font-display text-4xl leading-[1.05] font-medium sm:text-5xl lg:text-[3.4rem]">{heading}</h2>
            ) : null}
            <RichText html={str(data.body)} dark className="mt-6 prose-p:text-white/85" />
            {hasLink(link) ? <ArrowLink link={link} dark className="mt-9" /> : null}
          </Reveal>
        </div>
        {image?.credit ? (
          <p className="absolute right-4 bottom-3 hidden text-[10px] text-white/45 sm:block">Photo: {image.credit}</p>
        ) : null}
      </section>
    );
  }

  return (
    <section id={anchor || undefined} className={cn("relative py-20 sm:py-28", bgClass(variant === "sage" ? "sage" : "ivory"))}>
      <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
        <Reveal className={cn("relative lg:col-span-6", imageLeft ? "lg:order-1" : "lg:order-2")} y={32}>
          <div
            aria-hidden="true"
            className={cn(
              "absolute -bottom-5 hidden h-2/3 w-2/3 rounded-md bg-sage/35 sm:block",
              imageLeft ? "-left-5" : "-right-5",
            )}
          />
          <div className="group relative aspect-[4/5] overflow-hidden rounded-md bg-forest shadow-[0_30px_80px_-30px_rgba(23,61,50,0.45)] sm:aspect-[5/5] lg:aspect-[4/5]">
            {image?.src ? (
              <SmartImage
                image={image}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="transition-transform duration-[2000ms] ease-out group-hover:scale-[1.06]"
              />
            ) : null}
            {badge ? (
              <div className="absolute top-5 left-5">
                <StatusPill dark>{badge}</StatusPill>
              </div>
            ) : null}
          </div>
        </Reveal>
        <Reveal className={cn("lg:col-span-6", imageLeft ? "lg:order-2" : "lg:order-1")} delay={0.1}>
          {eyebrow ? (
            <p className="eyebrow flex items-center gap-3 text-earth">
              <span className="h-px w-8 bg-earth/50" aria-hidden="true" />
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h2 className="mt-4 font-display text-3xl leading-[1.08] font-medium text-forest sm:text-4xl lg:text-[2.9rem]">
              {heading}
            </h2>
          ) : null}
          <RichText html={str(data.body)} className="mt-6" />
          {hasLink(link) ? <ArrowLink link={link} className="mt-9" /> : null}
        </Reveal>
      </div>
    </section>
  );
}
