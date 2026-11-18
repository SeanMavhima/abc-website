import { ArrowRight } from "lucide-react";
import type { LinkRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { sanitizeRichText } from "@/lib/sanitize";
import { Reveal } from "@/components/site/reveal";
import { SmartLink } from "@/components/site/smart-link";

export type Background = "ivory" | "white" | "sage" | "forest";

export function bgClass(bg: unknown) {
  switch (bg) {
    case "white":
      return "bg-white";
    case "sage":
      return "bg-[color-mix(in_oklab,var(--brand-sage)_28%,var(--brand-ivory))]";
    case "forest":
      return "bg-forest text-white";
    default:
      return "bg-ivory";
  }
}

export const isDark = (bg: unknown) => bg === "forest";

export function SectionShell({
  id,
  background,
  className,
  children,
}: {
  id?: string;
  background?: unknown;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id || undefined} className={cn("relative py-20 sm:py-28", bgClass(background), className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  heading,
  intro,
  align = "left",
  dark = false,
  className,
  action,
}: {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
  action?: React.ReactNode;
}) {
  if (!eyebrow && !heading && !intro) return null;
  return (
    <Reveal
      className={cn(
        "mb-12 flex flex-col gap-6 sm:mb-16",
        align === "center" ? "mx-auto max-w-3xl items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn(align === "left" && "max-w-3xl")}>
        {eyebrow ? (
          <p className={cn("eyebrow flex items-center gap-3", dark ? "text-sage" : "text-earth", align === "center" && "justify-center")}>
            <span className={cn("h-px w-8", dark ? "bg-sage/60" : "bg-earth/50")} aria-hidden="true" />
            {eyebrow}
          </p>
        ) : null}
        {heading ? (
          <h2
            className={cn(
              "mt-4 font-display text-3xl leading-[1.08] font-medium sm:text-4xl lg:text-[2.9rem]",
              dark ? "text-white" : "text-forest",
            )}
          >
            {heading}
          </h2>
        ) : null}
        {intro ? (
          <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-white/75" : "text-charcoal/70")}>{intro}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Reveal>
  );
}

export function RichText({ html, dark = false, className }: { html: string; dark?: boolean; className?: string }) {
  const clean = sanitizeRichText(html);
  if (!clean || clean === "<p></p>") return null;
  return (
    <div
      className={cn("prose prose-lg prose-abc max-w-none", dark && "prose-invert-abc", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export function hasLink(link: unknown): link is LinkRef {
  const l = link as LinkRef | undefined;
  return Boolean(l && typeof l.label === "string" && l.label && typeof l.href === "string" && l.href);
}

export function ArrowLink({
  link,
  dark = false,
  variant = "button",
  className,
}: {
  link: LinkRef;
  dark?: boolean;
  variant?: "button" | "text";
  className?: string;
}) {
  if (variant === "text") {
    return (
      <SmartLink
        href={link.href}
        className={cn(
          "group inline-flex items-center gap-2 text-sm font-semibold",
          dark ? "text-sage hover:text-white" : "text-evergreen hover:text-forest",
          className,
        )}
      >
        <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-bottom-left bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
          {link.label}
        </span>
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </SmartLink>
    );
  }
  return (
    <SmartLink
      href={link.href}
      className={cn(
        "group inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-all",
        dark ? "bg-white text-forest hover:bg-sage" : "bg-forest text-white hover:bg-evergreen",
        className,
      )}
    >
      {link.label}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </SmartLink>
  );
}

export function StatusPill({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        dark ? "bg-white/12 text-white ring-1 ring-white/25 backdrop-blur-md" : "bg-earth/10 text-earth",
      )}
    >
      <span className={cn("size-1.5 rounded-full", dark ? "bg-sage" : "bg-earth")} aria-hidden="true" />
      {children}
    </span>
  );
}
