"use client";

/**
 * The field notebook: a visitor's own list of saved species, with their
 * notes. It lives only in the browser's local storage. Nothing is sent to
 * ABC, no account is needed and clearing the browser clears the notebook.
 */
import * as React from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import type { ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";

export type NotebookEntry = {
  slug: string;
  common_name: string;
  scientific_name: string;
  photo: ImageRef | null;
  note: string;
  savedAt: string;
};

const KEY = "abc-field-notebook";
const EVENT = "abc-notebook-change";

function read(): NotebookEntry[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((e) => e && typeof e.slug === "string") : [];
  } catch {
    return [];
  }
}

function write(entries: NotebookEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 200)));
  } catch {
    /* storage full or unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useNotebook() {
  const [entries, setEntries] = React.useState<NotebookEntry[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const sync = () => setEntries(read());
    sync();
    setLoaded(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    entries,
    loaded,
    has: (slug: string) => entries.some((e) => e.slug === slug),
    toggle: (entry: Omit<NotebookEntry, "note" | "savedAt">) => {
      const current = read();
      write(
        current.some((e) => e.slug === entry.slug)
          ? current.filter((e) => e.slug !== entry.slug)
          : [...current, { ...entry, note: "", savedAt: new Date().toISOString() }],
      );
    },
    setNote: (slug: string, note: string) => write(read().map((e) => (e.slug === slug ? { ...e, note: note.slice(0, 2000) } : e))),
    remove: (slug: string) => write(read().filter((e) => e.slug !== slug)),
    clear: () => write([]),
  };
}

export function NotebookButton({
  entry,
  variant = "icon",
  className,
}: {
  entry: Omit<NotebookEntry, "note" | "savedAt">;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { has, toggle } = useNotebook();
  const saved = has(entry.slug);
  const Icon = saved ? BookmarkCheck : BookmarkPlus;
  const label = saved ? `Remove ${entry.common_name} from your field notebook` : `Save ${entry.common_name} to your field notebook`;
  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(entry)}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-12 items-center gap-2.5 rounded-full px-6 text-[15px] font-semibold transition",
          saved ? "bg-gold text-night hover:bg-sand" : "bg-forest text-white hover:bg-evergreen",
          className,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
        {saved ? "Saved to field notebook" : "Save to field notebook"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggle(entry);
      }}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-10 items-center justify-center rounded-full backdrop-blur transition",
        saved ? "bg-gold text-night" : "bg-black/40 text-white hover:bg-black/65",
        className,
      )}
    >
      <Icon className="size-4.5" aria-hidden="true" />
    </button>
  );
}
