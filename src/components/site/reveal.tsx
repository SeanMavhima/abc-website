"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useMotionPreference } from "./motion-provider";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "article";
};

/** Fades and lifts content into view once, as it scrolls into the viewport. */
export function Reveal({ children, delay = 0, y = 24, as = "div", ...props }: RevealProps) {
  const { reduced } = useMotionPreference();
  const Comp = motion[as] as typeof motion.div;
  if (reduced) {
    // Show immediately. (The server renders the hidden starting state, so it has to be cleared explicitly.)
    return (
      <Comp initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0 }} {...props}>
        {children}
      </Comp>
    );
  }
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Comp>
  );
}
