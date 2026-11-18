"use client";

import * as React from "react";

/** Tracks whether `value` differs from the last saved snapshot. */
export function useDirty<T>(value: T) {
  const [saved, setSaved] = React.useState(() => JSON.stringify(value));
  const current = JSON.stringify(value);
  return {
    dirty: current !== saved,
    markSaved: React.useCallback((v?: T) => setSaved(JSON.stringify(v === undefined ? value : v)), [value]),
  };
}
