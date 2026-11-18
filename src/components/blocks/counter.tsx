"use client";

import * as React from "react";
import { animate, useInView } from "framer-motion";
import { useMotionPreference } from "@/components/site/motion-provider";

/** Counts up to `value` once when scrolled into view. */
export function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const { reduced } = useMotionPreference();
  const decimals = Number.isInteger(value) ? 0 : 1;
  const format = React.useCallback(
    (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [decimals],
  );
  const [display, setDisplay] = React.useState(() => format(0));

  React.useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(format(value));
      return;
    }
    const controls = animate(0, value, {
      duration: Math.min(2.4, 1.2 + value / 400),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(format(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, value, format]);

  return (
    <span ref={ref} className="tabular-nums">
      <span className="sr-only">
        {prefix}
        {format(value)}
        {suffix}
      </span>
      <span aria-hidden="true">
        {prefix}
        {display}
        {suffix}
      </span>
    </span>
  );
}
