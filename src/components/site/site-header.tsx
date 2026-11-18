"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import type { NavTreeItem, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { SmartLink } from "./smart-link";

type HeaderSettings = Pick<SiteSettings, "logo" | "short_name" | "org_name" | "header_cta_label" | "header_cta_href">;

function isActive(pathname: string, href: string) {
  if (!href || href.startsWith("http")) return false;
  const path = href.split("#")[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SiteHeader({ settings, items }: { settings: HeaderSettings; items: NavTreeItem[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    // The header stays transparent for as long as the immersive homepage opening is on screen.
    const onScroll = () => {
      const hero = document.querySelector("[data-hero-track]");
      setScrolled(window.scrollY > 40 && (!hero || hero.getBoundingClientRect().bottom < 90));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  React.useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const solid = scrolled || mobileOpen;

  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid
            ? "border-b border-forest/10 bg-ivory/90 py-3 shadow-[0_8px_30px_-12px_rgba(23,61,50,0.18)] backdrop-blur-xl"
            : "bg-gradient-to-b from-black/45 to-transparent py-5",
        )}
      >
        <div className="container-site flex items-center justify-between gap-6">
          <Link href="/" className="relative z-10 shrink-0 rounded-lg" aria-label={`${settings.org_name}: home`}>
            <Logo settings={settings} tone={solid ? "dark" : "light"} />
          </Link>

          <nav ref={navRef} aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {items.map((item) => {
                const active = isActive(pathname, item.href) || item.children.some((c) => isActive(pathname, c.href));
                const linkClass = cn(
                  "relative inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.9rem] font-medium transition-colors",
                  solid ? "text-charcoal/80 hover:bg-forest/5 hover:text-forest" : "text-white/85 hover:bg-white/10 hover:text-white",
                  active && (solid ? "text-forest" : "text-white"),
                );
                if (item.children.length === 0) {
                  return (
                    <li key={item.id}>
                      <SmartLink href={item.href || "/"} newTab={item.open_in_new_tab} className={linkClass} aria-current={active ? "page" : undefined}>
                        {item.label}
                        {active ? <ActiveDot solid={solid} /> : null}
                      </SmartLink>
                    </li>
                  );
                }
                const open = openDropdown === item.id;
                return (
                  <li
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.id)}
                    onMouseLeave={() => setOpenDropdown((v) => (v === item.id ? null : v))}
                  >
                    <button
                      type="button"
                      className={linkClass}
                      aria-expanded={open}
                      aria-haspopup="true"
                      onClick={() => setOpenDropdown(open ? null : item.id)}
                    >
                      {item.label}
                      <ChevronDown className={cn("size-3.5 transition-transform duration-300", open && "rotate-180")} />
                      {active ? <ActiveDot solid={solid} /> : null}
                    </button>
                    <AnimatePresence>
                      {open ? (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-1/2 w-64 -translate-x-1/2 pt-3"
                        >
                          <ul className="overflow-hidden rounded-md border border-forest/10 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(23,61,50,0.35)]">
                            {item.children.map((child) => (
                              <li key={child.id}>
                                <SmartLink
                                  href={child.href || "/"}
                                  newTab={child.open_in_new_tab}
                                  className={cn(
                                    "group flex items-center justify-between rounded-sm px-3.5 py-2.5 text-sm text-charcoal/80 transition-colors hover:bg-ivory hover:text-forest",
                                    isActive(pathname, child.href) && "bg-ivory font-semibold text-forest",
                                  )}
                                >
                                  {child.label}
                                  <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                                </SmartLink>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {settings.header_cta_label && settings.header_cta_href ? (
              <SmartLink
                href={settings.header_cta_href}
                className={cn(
                  "hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all sm:inline-flex",
                  solid ? "bg-forest text-white hover:bg-evergreen" : "bg-white text-forest hover:bg-ivory",
                )}
              >
                {settings.header_cta_label}
                <ArrowRight className="size-4" />
              </SmartLink>
            ) : null}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "relative z-10 inline-flex size-11 items-center justify-center rounded-full transition-colors lg:hidden",
                solid ? "text-forest hover:bg-forest/5" : "text-white hover:bg-white/10",
              )}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "calc(100dvh - 4.25rem)" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-y-auto lg:hidden"
            >
              <nav aria-label="Mobile" className="container-site pt-6 pb-10">
                <ul className="divide-y divide-forest/10">
                  {items.map((item, i) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i + 0.1 }}
                    >
                      {item.children.length === 0 ? (
                        <SmartLink
                          href={item.href || "/"}
                          newTab={item.open_in_new_tab}
                          className="flex items-center justify-between py-4 font-display text-2xl font-medium text-forest"
                        >
                          {item.label}
                          <ArrowRight className="size-5 text-sage" />
                        </SmartLink>
                      ) : (
                        <div>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between py-4 text-left font-display text-2xl font-medium text-forest"
                            aria-expanded={mobileExpanded === item.id}
                            onClick={() => setMobileExpanded((v) => (v === item.id ? null : item.id))}
                          >
                            {item.label}
                            <ChevronDown
                              className={cn("size-5 text-sage transition-transform", mobileExpanded === item.id && "rotate-180")}
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {mobileExpanded === item.id ? (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pb-3"
                              >
                                {item.children.map((child) => (
                                  <li key={child.id}>
                                    <SmartLink
                                      href={child.href || "/"}
                                      newTab={child.open_in_new_tab}
                                      className="block rounded-lg py-2.5 pl-4 text-base text-charcoal/75 hover:text-forest"
                                    >
                                      {child.label}
                                    </SmartLink>
                                  </li>
                                ))}
                              </motion.ul>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
                {settings.header_cta_label && settings.header_cta_href ? (
                  <SmartLink
                    href={settings.header_cta_href}
                    className="mt-8 flex h-14 items-center justify-center gap-2 rounded-full bg-forest text-base font-semibold text-white"
                  >
                    {settings.header_cta_label}
                    <ArrowRight className="size-5" />
                  </SmartLink>
                ) : null}
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  );
}

function ActiveDot({ solid }: { solid: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn("absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full", solid ? "bg-evergreen" : "bg-sage")}
    />
  );
}
