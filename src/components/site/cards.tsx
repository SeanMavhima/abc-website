import Link from "next/link";
import { ArrowUpRight, Clock, PlayCircle } from "lucide-react";
import type { Article, Programme } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { cn, formatDate, readingTime } from "@/lib/utils";
import { ImagePlaceholder, SmartImage } from "./smart-image";

export const PROGRAMME_STATUS_LABEL: Record<Programme["status"], string> = {
  proposed: "Proposed programme area",
  pilot: "Pilot phase",
  active: "Active programme",
  completed: "Completed",
};

export function ProgrammeCard({ programme, size = "default" }: { programme: Programme; size?: "default" | "large" }) {
  const Icon = getIcon(programme.icon);
  return (
    <Link
      href={`/programmes/${programme.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-md bg-white ring-1 ring-forest/8 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-30px_rgba(23,61,50,0.4)]"
    >
      <div className={cn("relative overflow-hidden bg-forest", size === "large" ? "aspect-[16/10]" : "aspect-[4/3]")}>
        {programme.cover_image?.src ? (
          <SmartImage
            image={programme.cover_image}
            fill
            sizes={size === "large" ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="transition-transform duration-[1600ms] ease-out group-hover:scale-110"
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-earth backdrop-blur">
          <span className="size-1.5 rounded-full bg-earth" aria-hidden="true" />
          {PROGRAMME_STATUS_LABEL[programme.status]}
        </span>
        <span className="absolute bottom-4 left-4 flex size-11 items-center justify-center rounded-md bg-white text-forest shadow-lg">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {programme.category ? <p className="eyebrow text-earth">{programme.category}</p> : null}
        <h3 className={cn("mt-2 font-display font-medium text-forest", size === "large" ? "text-2xl sm:text-3xl" : "text-xl")}>
          {programme.title}
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-charcoal/70">{programme.summary}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-evergreen">
          Explore programme
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function StoryCard({ article, variant = "default" }: { article: Article; variant?: "default" | "feature" | "compact" }) {
  const href = `/stories/${article.slug}`;
  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
      {article.category ? <span className="font-semibold tracking-[0.14em] uppercase">{article.category.name}</span> : null}
      {article.published_at ? <span className="opacity-70">{formatDate(article.published_at)}</span> : null}
      <span className="inline-flex items-center gap-1 opacity-70">
        <Clock className="size-3" /> {readingTime(article.content)} min read
      </span>
    </div>
  );

  if (variant === "feature") {
    return (
      <Link href={href} className="group relative isolate flex h-full min-h-[28rem] flex-col justify-end overflow-hidden rounded-md bg-forest p-7 text-white sm:p-10 lg:min-h-[34rem]">
        {article.featured_image?.src ? (
          <SmartImage
            image={article.featured_image}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="-z-20 transition-transform duration-[1800ms] ease-out group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        {article.video_url ? <PlayCircle className="absolute top-7 right-7 size-10 text-white/90" /> : null}
        <div className="text-sage">{meta}</div>
        <h3 className="mt-4 max-w-2xl font-display text-2xl leading-tight font-medium sm:text-4xl">{article.title}</h3>
        {article.excerpt ? <p className="mt-4 max-w-xl text-white/80">{article.excerpt}</p> : null}
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
          Read story <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full gap-5",
        variant === "compact" ? "flex-row items-center" : "flex-col",
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md bg-forest",
          variant === "compact" ? "aspect-square w-28 rounded-md sm:w-36" : "aspect-[3/2] w-full",
        )}
      >
        {article.featured_image?.src ? (
          <SmartImage
            image={article.featured_image}
            fill
            sizes={variant === "compact" ? "160px" : "(min-width: 1024px) 33vw, 100vw"}
            className="transition-transform duration-[1600ms] ease-out group-hover:scale-110"
          />
        ) : (
          <ImagePlaceholder />
        )}
        {article.video_url ? <PlayCircle className="absolute top-3 right-3 size-7 text-white drop-shadow" /> : null}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="text-earth">{meta}</div>
        <h3
          className={cn(
            "mt-3 font-display leading-snug font-medium text-forest transition-colors group-hover:text-evergreen",
            variant === "compact" ? "text-lg" : "text-xl",
          )}
        >
          {article.title}
        </h3>
        {variant !== "compact" && article.excerpt ? (
          <p className="mt-3 line-clamp-3 leading-relaxed text-charcoal/70">{article.excerpt}</p>
        ) : null}
      </div>
    </Link>
  );
}
