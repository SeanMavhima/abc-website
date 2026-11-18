"use client";

import * as React from "react";
import type { Quality } from "./world";

const KEY = "abc-3d";
const EVENT = "abc-3d-change";
const STRUGGLE_KEY = "abc-3d-struggled";

/**
 * "auto": the site decides (3D where the device suits it).
 * "on":   the visitor asked for 3D, so it is shown wherever WebGL exists,
 *         even with reduced motion or on a modest device.
 * "off":  the visitor asked for photographs.
 */
export type ImmersiveChoice = "auto" | "on" | "off";

function read(): ImmersiveChoice {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "on" || v === "off" ? v : "auto";
  } catch {
    return "auto";
  }
}

/**
 * The visitor's own switch for the 3D landscape, remembered on their device.
 * It is shared by the homepage hero and the footer toggle.
 */
export function useImmersivePreference() {
  const [choice, setChoiceState] = React.useState<ImmersiveChoice>("auto");

  React.useEffect(() => {
    const sync = () => setChoiceState(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setEnabled = React.useCallback((on: boolean) => {
    try {
      window.localStorage.setItem(KEY, on ? "on" : "off");
      if (on) window.sessionStorage.removeItem(STRUGGLE_KEY);
    } catch {
      /* storage unavailable: the choice lasts for this page only */
    }
    setChoiceState(on ? "on" : "off");
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { choice, enabled: choice !== "off", setEnabled };
}

/** Remembers, for this browsing session, that the device could not keep up. */
export function markStruggled() {
  try {
    window.sessionStorage.setItem(STRUGGLE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Whether this browser can draw 3D at all. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Decides how much the device can draw when the visitor has not chosen.
 * "none" means: show photographs (the visitor can still switch 3D on).
 *
 * The checks are deliberately conservative. A beautiful landscape that
 * stutters on an ordinary phone is worse than a good photograph.
 */
export function detectCapability(): Quality | "none" {
  try {
    if (window.sessionStorage.getItem(STRUGGLE_KEY)) return "none";
  } catch {
    /* ignore */
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "none";
  if (!hasWebGL()) return "none";

  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  if (cores <= 2 || memory <= 1) return "none";

  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (cores <= 4 || memory <= 4 || (small && coarse)) return "low";
  return "high";
}
