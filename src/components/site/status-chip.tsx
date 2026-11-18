import { IUCN_STATUS, type Tone } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * Small "specimen label" for a status. The marker shows how far along
 * something is: an empty ring for proposed or planned, a half-filled ring for
 * under way, a solid dot for done.
 */
export function StatusChip({ label, tone, dark = false, className }: { label: string; tone: Tone; dark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-2 rounded-sm px-2 py-1",
        dark ? "bg-white/8 text-white/85 ring-1 ring-white/15" : "bg-forest/5 text-forest ring-1 ring-forest/10",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-2 rounded-full ring-1", dark ? "ring-gold" : "ring-earth")}
        style={
          tone === "solid"
            ? { background: "currentColor" }
            : tone === "progress"
              ? { background: "linear-gradient(90deg, currentColor 50%, transparent 50%)" }
              : undefined
        }
      />
      {label}
    </span>
  );
}

/** IUCN Red List category, shown as its code with the full name alongside. */
export function IucnChip({ code, dark = false, compact = false }: { code: string; dark?: boolean; compact?: boolean }) {
  const s = IUCN_STATUS[code];
  if (!s) return null;
  return (
    <span
      className={cn("label-mono inline-flex items-center gap-2 rounded-sm px-2 py-1", dark ? "bg-black/45 text-white backdrop-blur" : "bg-forest/5 text-charcoal ring-1 ring-forest/10")}
      title={`IUCN Red List: ${s.label}`}
    >
      <span aria-hidden="true" className="size-2 rounded-full" style={{ background: s.color }} />
      <span>{code}</span>
      {compact ? <span className="sr-only">{s.label}</span> : <span className="tracking-[0.08em] normal-case opacity-80">{s.label}</span>}
    </span>
  );
}
