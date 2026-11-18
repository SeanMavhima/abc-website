"use client";

import { Box } from "lucide-react";
import { useImmersivePreference } from "@/components/experience/use-immersive";

/** Lets a visitor switch the homepage 3D landscape off (lighter on data and battery) or back on. */
export function ImmersiveToggle() {
  const { choice, enabled, setEnabled } = useImmersivePreference();
  return (
    <button
      type="button"
      onClick={() => setEnabled(choice !== "on")}
      aria-pressed={choice === "on"}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white/60 ring-1 ring-white/15 transition hover:text-white hover:ring-white/40"
    >
      <Box className="size-3.5" aria-hidden="true" />
      {choice === "on" ? "3D landscape: on" : enabled ? "3D landscape: automatic" : "3D landscape: off"}
    </button>
  );
}
