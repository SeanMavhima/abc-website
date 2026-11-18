import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SmartImage } from "./smart-image";

export type Crumb = { label: string; href?: string };

/** Photographic page header used by every inner page. */
export function PageHero({
  eyebrow,
  title,
  description,
  image,
  crumbs,
  children,
  size = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: ImageRef | null;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  size?: "default" | "compact";
}) {
  return (
    <section
      className={cn(
        "relative isolate flex items-end overflow-hidden bg-forest text-white",
        size === "compact" ? "min-h-[46vh] pt-36 pb-14" : "min-h-[64vh] pt-40 pb-16 sm:min-h-[70vh] sm:pb-20",
      )}
    >
      {image?.src ? (
        <>
          <SmartImage image={image} fill priority sizes="100vw" className="-z-20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest via-forest/55 to-black/30" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/40 to-transparent" />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--brand-evergreen),transparent_60%)]"
        />
      )}
      <div className="container-site">
        {crumbs && crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-white/65">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  <ChevronRight className="size-3" aria-hidden="true" />
                  {c.href ? (
                    <Link href={c.href} className="hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white/90">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <div className="max-w-3xl animate-fade-in">
          {eyebrow ? <p className="eyebrow text-sage">{eyebrow}</p> : null}
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-medium sm:text-5xl lg:text-6xl">{title}</h1>
          {description ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">{description}</p> : null}
          {children}
        </div>
      </div>
      {image?.credit ? (
        <p className="absolute right-4 bottom-3 hidden max-w-xs text-right text-[10px] text-white/45 sm:block">
          Photo: {image.credit}
        </p>
      ) : null}
    </section>
  );
}
