import { ArrowUpRight } from "lucide-react";
import type { ImageRef, LinkRef } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { arr, cn, str } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";
import { ImagePlaceholder, SmartImage } from "@/components/site/smart-image";
import { SmartLink } from "@/components/site/smart-link";
import { ArrowLink, SectionHeading, SectionShell, hasLink, isDark } from "./shared";

type CardItem = { icon?: string; title?: string; text?: string; image?: ImageRef | null; link?: LinkRef };

const COLS: Record<string, string> = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
  "5": "sm:grid-cols-2 lg:grid-cols-5",
};

export function CardsBlock({ data }: { data: Record<string, unknown> }) {
  const items = arr<CardItem>(data.items);
  if (items.length === 0) return null;
  const layout = str(data.layout, "icon");
  const dark = isDark(data.background);
  const cols = COLS[str(data.columns, "3")] ?? COLS["3"];

  return (
    <SectionShell id={str(data.anchor)} background={data.background}>
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} dark={dark} />
        <ul className={cn("grid gap-5", cols, layout === "image" && "gap-4")}>
          {items.map((item, i) => (
            <Reveal as="li" key={`${item.title}-${i}`} delay={Math.min(i, 5) * 0.08} className="h-full">
              {layout === "image" ? (
                <ImageCard item={item} />
              ) : layout === "numbered" ? (
                <NumberedCard item={item} index={i} dark={dark} />
              ) : layout === "minimal" ? (
                <MinimalCard item={item} dark={dark} />
              ) : (
                <IconCard item={item} dark={dark} />
              )}
            </Reveal>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}

function IconCard({ item, dark }: { item: CardItem; dark: boolean }) {
  const Icon = getIcon(item.icon);
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-md p-7 transition-all duration-500 hover:-translate-y-1.5",
        dark
          ? "bg-white/6 ring-1 ring-white/10 hover:bg-white/10"
          : "bg-white ring-1 ring-forest/8 hover:shadow-[0_24px_60px_-24px_rgba(23,61,50,0.35)] hover:ring-forest/15",
      )}
    >
      <span
        className={cn(
          "flex size-13 items-center justify-center rounded-md transition-colors duration-500",
          dark ? "bg-sage/15 text-sage group-hover:bg-sage group-hover:text-forest" : "bg-sage/25 text-forest group-hover:bg-forest group-hover:text-white",
        )}
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <h3 className={cn("mt-7 font-display text-xl leading-snug font-medium", dark ? "text-white" : "text-forest")}>{item.title}</h3>
      {item.text ? (
        <p className={cn("mt-3 flex-1 text-[0.95rem] leading-relaxed", dark ? "text-white/70" : "text-charcoal/70")}>{item.text}</p>
      ) : (
        <span className="flex-1" />
      )}
      {hasLink(item.link) ? <ArrowLink link={item.link} variant="text" dark={dark} className="mt-6" /> : null}
    </div>
  );
}

function NumberedCard({ item, index, dark }: { item: CardItem; index: number; dark: boolean }) {
  const Icon = getIcon(item.icon);
  return (
    <div className={cn("group flex h-full flex-col border-t-2 pt-7 transition-colors", dark ? "border-white/15 hover:border-sage" : "border-forest/12 hover:border-evergreen")}>
      <div className="flex items-center justify-between">
        <span className={cn("font-display text-5xl font-medium tabular-nums", dark ? "text-sage/60" : "text-sage")}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <Icon className={cn("size-6 transition-transform duration-500 group-hover:rotate-6", dark ? "text-sage" : "text-earth")} strokeWidth={1.75} />
      </div>
      <h3 className={cn("mt-6 font-display text-xl font-medium", dark ? "text-white" : "text-forest")}>{item.title}</h3>
      {item.text ? <p className={cn("mt-3 leading-relaxed", dark ? "text-white/70" : "text-charcoal/70")}>{item.text}</p> : null}
      {hasLink(item.link) ? <ArrowLink link={item.link} variant="text" dark={dark} className="mt-5" /> : null}
    </div>
  );
}

function MinimalCard({ item, dark }: { item: CardItem; dark: boolean }) {
  return (
    <div className="h-full">
      <h3 className={cn("font-display text-lg font-medium", dark ? "text-white" : "text-forest")}>{item.title}</h3>
      {item.text ? <p className={cn("mt-2 leading-relaxed", dark ? "text-white/70" : "text-charcoal/70")}>{item.text}</p> : null}
      {hasLink(item.link) ? <ArrowLink link={item.link} variant="text" dark={dark} className="mt-4" /> : null}
    </div>
  );
}

function ImageCard({ item }: { item: CardItem }) {
  const Icon = getIcon(item.icon);
  const content = (
    <>
      {item.image?.src ? (
        <SmartImage
          image={item.image}
          fill
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-[1600ms] ease-out group-hover:scale-110"
        />
      ) : (
        <ImagePlaceholder />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5 transition-opacity duration-500 group-hover:from-forest/95" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col p-6 text-white">
        <span className="flex size-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <h3 className="mt-4 font-display text-xl leading-snug font-medium">{item.title}</h3>
        {item.text ? (
          <p className="mt-2 text-sm leading-relaxed text-white/80 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-500 lg:group-hover:max-h-40 lg:group-hover:opacity-100 lg:group-focus-visible:max-h-40 lg:group-focus-visible:opacity-100">
            {item.text}
          </p>
        ) : null}
        {hasLink(item.link) ? (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sage">
            {item.link.label}
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        ) : null}
      </div>
    </>
  );
  const cls = "group relative block h-[26rem] w-full overflow-hidden rounded-md bg-forest lg:h-[30rem]";
  return hasLink(item.link) ? (
    <SmartLink href={item.link.href} className={cls}>
      {content}
    </SmartLink>
  ) : (
    <div className={cls}>{content}</div>
  );
}
