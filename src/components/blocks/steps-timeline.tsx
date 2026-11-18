"use client";

import type * as React from "react";
import { motion } from "framer-motion";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useMotionPreference } from "@/components/site/motion-provider";

type Step = { icon?: string; title?: string; text?: string };

/**
 * Research-to-action pathway: horizontal timeline on large screens and a
 * vertical timeline on smaller screens. Steps animate in as they scroll into view.
 */
export function StepsTimeline({ items, dark }: { items: Step[]; dark: boolean }) {
  const { reduced } = useMotionPreference();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="relative">
      {/* Horizontal connector (desktop) */}
      <div aria-hidden="true" className="absolute top-8 right-[8%] left-[8%] hidden h-px lg:block">
        <div className={cn("absolute inset-0", dark ? "bg-white/15" : "bg-forest/12")} />
        <motion.div
          className={cn("absolute inset-0 origin-left", dark ? "bg-sage" : "bg-evergreen")}
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.8, ease }}
        />
      </div>
      {/* Vertical connector (mobile) */}
      <div aria-hidden="true" className={cn("absolute top-4 bottom-4 left-8 w-px lg:hidden", dark ? "bg-white/15" : "bg-forest/12")} />

      <ol
        className="relative grid gap-10 lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-6"
        style={{ "--steps": items.length } as React.CSSProperties}
      >
          {items.map((step, i) => {
            const Icon = getIcon(step.icon);
            return (
              <motion.li
                key={`${step.title}-${i}`}
                className="relative flex gap-6 lg:flex-col lg:items-center lg:gap-0 lg:text-center"
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: reduced ? 0 : 0.15 + i * 0.14, ease }}
              >
                <span
                  className={cn(
                    "group relative z-10 flex size-16 shrink-0 items-center justify-center rounded-full ring-8 transition-transform duration-500 hover:scale-110",
                    dark ? "bg-evergreen text-sage ring-forest" : "bg-white text-forest shadow-[0_10px_30px_-12px_rgba(23,61,50,0.4)] ring-ivory",
                  )}
                >
                  <Icon className="size-6" strokeWidth={1.75} />
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
                      dark ? "bg-sage text-forest" : "bg-forest text-white",
                    )}
                  >
                    {i + 1}
                  </span>
                </span>
                <div className="pt-2 lg:mt-6 lg:px-2 lg:pt-0">
                  <h3 className={cn("font-display text-xl font-medium tracking-tight uppercase", dark ? "text-white" : "text-forest")}>
                    {step.title}
                  </h3>
                  {step.text ? (
                    <p className={cn("mt-2 text-[0.95rem] leading-relaxed", dark ? "text-white/70" : "text-charcoal/70")}>{step.text}</p>
                  ) : null}
                </div>
              </motion.li>
            );
          })}
      </ol>
    </div>
  );
}
