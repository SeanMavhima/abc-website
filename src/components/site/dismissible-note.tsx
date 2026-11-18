"use client";

import * as React from "react";
import { X } from "lucide-react";

export function DismissibleNote({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;
  return (
    <div
      role="note"
      className="fixed right-3 bottom-3 left-3 z-[60] mx-auto flex max-w-xl items-start gap-3 rounded-md bg-charcoal/95 py-3 pr-2 pl-4 text-xs leading-relaxed text-white shadow-2xl ring-1 ring-white/10 backdrop-blur sm:left-auto"
    >
      <span className="mt-1 size-2 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
      <p className="flex-1">{children}</p>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
        aria-label="Dismiss notice"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
