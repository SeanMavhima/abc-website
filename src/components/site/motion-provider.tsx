"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

type MotionPref = { reduced: boolean; userSetting: boolean | null; setUserSetting: (v: boolean | null) => void };

const MotionContext = React.createContext<MotionPref>({ reduced: false, userSetting: null, setUserSetting: () => {} });

const STORAGE_KEY = "abc-reduce-motion";

/**
 * Combines the operating system's prefers-reduced-motion setting with an
 * explicit on-site "Reduce motion" toggle (stored in localStorage).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  // Read after mount, so the first client render matches the server-rendered page.
  const [systemReduced, setSystemReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const [userSetting, setUserSettingState] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v === "true" || v === "false") setUserSettingState(v === "true");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setUserSetting = React.useCallback((v: boolean | null) => {
    setUserSettingState(v);
    try {
      if (v === null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const reduced = userSetting ?? systemReduced;

  React.useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduced ? "true" : "false";
  }, [reduced]);

  return (
    <MotionContext.Provider value={{ reduced, userSetting, setUserSetting }}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>
    </MotionContext.Provider>
  );
}

export function useMotionPreference() {
  return React.useContext(MotionContext);
}
