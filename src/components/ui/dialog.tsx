"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal dialog built on the native <dialog> element, which provides focus
 * trapping, Escape-to-close and an accessible modal role without extra
 * dependencies.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // React propagates the native "close" event through the component tree,
      // so closing a nested dialog (such as the media picker opened from a
      // team member form) would otherwise close this one too.
      onClose={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      onClick={(e) => {
        if (e.target === ref.current) onOpenChange(false);
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-2xl border border-border bg-white p-0 text-charcoal shadow-2xl backdrop:bg-charcoal/50 backdrop:backdrop-blur-sm open:animate-fade-in",
        className,
      )}
    >
      {open ? (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <h2 id={titleId} className="font-display text-lg font-semibold">
                {title}
              </h2>
              {description ? <p className="mt-0.5 text-sm text-muted-foreground">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-charcoal"
              aria-label="Close dialog"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
          {footer ? <div className="flex justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}
