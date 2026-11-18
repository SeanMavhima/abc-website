"use client";

import { Pause, Play } from "lucide-react";
import { useMotionPreference } from "./motion-provider";

/** Site-wide accessibility setting to reduce animation. */
export function MotionToggle() {
  const { reduced, setUserSetting } = useMotionPreference();
  return (
    <button
      type="button"
      onClick={() => setUserSetting(!reduced)}
      aria-pressed={reduced}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white/60 ring-1 ring-white/15 transition hover:text-white hover:ring-white/40"
    >
      {reduced ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
      {reduced ? "Enable motion" : "Reduce motion"}
    </button>
  );
}
