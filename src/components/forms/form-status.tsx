"use client";

import * as React from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import type { FormResult } from "@/lib/validation/forms";
import { cn } from "@/lib/utils";

/** Hidden honeypot field and a timestamp, used for spam protection. */
export function useAntiSpam() {
  const [startedAt] = React.useState(() => Date.now());
  const honeypotRef = React.useRef<HTMLInputElement>(null);
  const fields = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this field empty
        <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
  return {
    fields,
    values: () => ({ website: honeypotRef.current?.value ?? "", startedAt }),
  };
}

export function FormStatus({ result, tone = "light" }: { result: FormResult | null; tone?: "light" | "dark" }) {
  if (!result || result.ok) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-sm px-4 py-3 text-sm",
        tone === "dark" ? "bg-red-500/15 text-red-100" : "bg-red-50 text-red-800",
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{result.message}</span>
    </div>
  );
}

export function FormSuccess({ message, onReset }: { message: string; onReset?: () => void }) {
  return (
    <div role="status" className="flex flex-col items-start gap-4 rounded-md bg-sage/20 p-6 sm:p-8">
      <span className="flex size-12 items-center justify-center rounded-full bg-forest text-white">
        <CheckCircle2 className="size-6" />
      </span>
      <div>
        <p className="font-display text-xl font-medium text-forest">Message received</p>
        <p className="mt-1 text-charcoal/75">{message}</p>
      </div>
      {onReset ? (
        <button type="button" onClick={onReset} className="text-sm font-semibold text-evergreen underline underline-offset-4">
          Send another
        </button>
      ) : null}
    </div>
  );
}
