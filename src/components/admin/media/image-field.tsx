"use client";

import * as React from "react";
import { ImageIcon, RefreshCw, X } from "lucide-react";
import type { ImageRef } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FieldHelp, Input, Label } from "@/components/ui/form-controls";
import { MediaPicker } from "./media-picker";

/** Image chooser with preview and editable alt text, stored as { src, alt, credit }. */
export function ImageField({
  label,
  value,
  onChange,
  help,
  compact = false,
}: {
  label: string;
  value: ImageRef | null | undefined;
  onChange: (value: ImageRef | null) => void;
  help?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const altId = React.useId();

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            compact
              ? "relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-input bg-muted text-muted-foreground hover:border-evergreen"
              : "relative flex aspect-[16/10] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-input bg-muted text-muted-foreground hover:border-evergreen sm:w-56"
          }
          aria-label={value?.src ? "Change image" : "Choose image"}
        >
          {value?.src ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview
            <img src={value.src} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-xs">
              <ImageIcon className="size-5" /> Choose image
            </span>
          )}
        </button>
        {value?.src ? (
          <div className="flex-1 space-y-2">
            <div>
              <label htmlFor={altId} className="mb-1 block text-xs font-medium text-muted-foreground">
                Alternative text (describes the image for screen readers)
              </label>
              <Input
                id={altId}
                value={value.alt ?? ""}
                onChange={(e) => onChange({ ...value, alt: e.target.value })}
                placeholder="e.g. Young people planting seedlings in Rwanda"
                className="h-9"
              />
            </div>
            {value.credit !== undefined ? (
              <Input
                value={value.credit ?? ""}
                onChange={(e) => onChange({ ...value, credit: e.target.value })}
                placeholder="Photo credit"
                aria-label="Photo credit"
                className="h-9"
              />
            ) : null}
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                <RefreshCw /> Replace
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                <X /> Remove
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      {help ? <FieldHelp>{help}</FieldHelp> : null}
      <MediaPicker
        open={open}
        onOpenChange={setOpen}
        onSelect={(asset) => onChange({ src: asset.url, alt: asset.alt_text || value?.alt || "", credit: asset.credit || "" })}
      />
    </div>
  );
}
