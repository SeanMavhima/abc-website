import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The ABC mark: two leaves forming a sheltering canopy around a seed. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true" fill="none">
      <circle cx="20" cy="20" r="19" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M20 31c0-8.5 3.6-14.6 11-18.5-7.9-.2-13.4 4.1-14.8 10.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 31c0-6.9-3.4-12.6-10.6-15.4 1.1 7.4 5.4 12.4 10.6 12.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="11" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  settings,
  tone = "dark",
  compact = false,
  className,
}: {
  settings: Pick<SiteSettings, "logo" | "short_name" | "org_name">;
  tone?: "dark" | "light";
  compact?: boolean;
  className?: string;
}) {
  const color = tone === "light" ? "text-white" : "text-forest";
  if (settings.logo?.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logos may be SVGs from storage; sized by CSS
      <img
        src={settings.logo.src}
        alt={settings.logo.alt || settings.org_name}
        className={cn("h-10 w-auto object-contain", className)}
      />
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-3", color, className)}>
      <LogoMark className={tone === "light" ? "text-sage" : "text-evergreen"} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.35rem] font-medium tracking-[0.08em]">{settings.short_name || "ABC"}</span>
        {!compact ? (
          <span
            className={cn(
              "mt-1 hidden max-w-[11rem] text-[0.6rem] font-medium tracking-[0.12em] uppercase sm:block",
              tone === "light" ? "text-white/70" : "text-charcoal/60",
            )}
          >
            {settings.org_name}
          </span>
        ) : null}
      </span>
    </span>
  );
}
