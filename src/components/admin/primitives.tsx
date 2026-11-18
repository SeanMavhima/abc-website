"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import type { ActionResult } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function AdminPageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <div className="mb-2 text-xs font-medium text-muted-foreground">{eyebrow}</div> : null}
        <h1 className="font-display text-2xl font-bold text-charcoal sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-sage/25 text-forest [&_svg]:size-6">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-base font-semibold">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Runs a server action, shows a toast and refreshes server data on success. */
export function useAction() {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const run = React.useCallback(
    async <T,>(promise: Promise<ActionResult<T>>, opts: { refresh?: boolean; silent?: boolean } = {}) => {
      setPending(true);
      try {
        const res = await promise;
        if (res.ok) {
          if (!opts.silent && res.message) toast.success(res.message);
          if (opts.refresh !== false) router.refresh();
        } else {
          toast.error(res.error);
        }
        return res;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong.");
        return { ok: false, error: "failed" } as ActionResult<T>;
      } finally {
        setPending(false);
      }
    },
    [router],
  );
  return { run, pending };
}

export function ConfirmButton({
  onConfirm,
  title = "Delete this item?",
  description = "This cannot be undone.",
  confirmLabel = "Delete",
  label,
  size = "icon-sm",
  variant = "ghost",
  disabled,
}: {
  onConfirm: () => Promise<unknown> | void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  label?: string;
  size?: "icon-sm" | "sm" | "default";
  variant?: "ghost" | "outline" | "destructive";
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label={label ?? confirmLabel}
        className={cn(variant === "ghost" && "text-muted-foreground hover:bg-red-50 hover:text-destructive")}
      >
        <Trash2 />
        {label && size !== "icon-sm" ? label : null}
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        className="max-w-md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                  setOpen(false);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? <Loader2 className="animate-spin" /> : <Trash2 />}
              {confirmLabel}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">{description}</p>
      </Dialog>
    </>
  );
}

export function MoveButtons({
  index,
  count,
  onMove,
  disabled,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled || index === 0}
        onClick={() => onMove(index, index - 1)}
        aria-label="Move up"
        className="text-muted-foreground"
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled || index === count - 1}
        onClick={() => onMove(index, index + 1)}
        aria-label="Move down"
        className="text-muted-foreground"
      >
        <ArrowDown />
      </Button>
    </div>
  );
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Sticky footer with save button; warns before leaving with unsaved changes. */
export function SaveBar({
  dirty,
  saving,
  onSave,
  label = "Save changes",
  extra,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  label?: string;
  extra?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t border-border bg-white/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <span className={cn("size-2 rounded-full", dirty ? "bg-amber-500" : "bg-emerald-500")} aria-hidden="true" />
          {dirty ? "Unsaved changes" : "All changes saved"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {extra}
          <Button type="button" onClick={onSave} disabled={saving || !dirty}>
            {saving ? <Loader2 className="animate-spin" /> : null}
            {saving ? "Saving" : label}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StatusDot({ tone }: { tone: "green" | "amber" | "grey" | "blue" }) {
  const map = { green: "bg-emerald-500", amber: "bg-amber-500", grey: "bg-zinc-400", blue: "bg-sky-500" };
  return <span className={cn("inline-block size-2 rounded-full", map[tone])} aria-hidden="true" />;
}
