"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Binoculars,
  Bird,
  ChartColumn,
  Eye,
  ExternalLink,
  FlaskConical,
  History,
  ListChecks,
  MapPin,
  Mountain,
  Shapes,
  FileText,
  FolderTree,
  Handshake,
  Home,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Navigation,
  Newspaper,
  Settings,
  ShieldCheck,
  Sprout,
  UserCircle,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/site/logo";
import { signOut } from "@/lib/actions/admin/account";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number };

export function AdminSidebar({ userLabel, counts }: { userLabel: string; counts: { contact: number; volunteer: number; observations: number } }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const groups: { title: string; items: NavItem[] }[] = [
    { title: "", items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }] },
    {
      title: "Content",
      items: [
        { href: "/admin/homepage", label: "Homepage", icon: Home },
        { href: "/admin/pages", label: "Pages", icon: FileText },
        { href: "/admin/programmes", label: "Programmes", icon: Sprout },
        { href: "/admin/nature-labs", label: "Nature Labs", icon: MapPin },
        { href: "/admin/stories", label: "Stories", icon: Newspaper },
        { href: "/admin/categories", label: "Story categories", icon: FolderTree },
        { href: "/admin/team", label: "Team", icon: Users },
        { href: "/admin/partners", label: "Organisations", icon: Handshake },
        { href: "/admin/media", label: "Media library", icon: Images },
      ],
    },
    {
      title: "Biodiversity",
      items: [
        { href: "/admin/atlas", label: "Atlas habitats", icon: Mountain },
        { href: "/admin/species", label: "Species", icon: Bird },
        { href: "/admin/species-groups", label: "Species groups", icon: Shapes },
      ],
    },
    {
      title: "Science and impact",
      items: [
        { href: "/admin/citizen-science", label: "Citizen science", icon: Binoculars },
        { href: "/admin/research", label: "Research projects", icon: FlaskConical },
        { href: "/admin/observations", label: "Observations", icon: Eye, badge: counts.observations },
        { href: "/admin/statistics", label: "Impact statistics", icon: ChartColumn },
        { href: "/admin/milestones", label: "Milestones", icon: ListChecks },
      ],
    },
    {
      title: "Inbox",
      items: [
        { href: "/admin/submissions/contact", label: "Contact enquiries", icon: Inbox, badge: counts.contact },
        { href: "/admin/submissions/volunteer", label: "Applications", icon: Users, badge: counts.volunteer },
        { href: "/admin/submissions/newsletter", label: "Newsletter", icon: Mail },
      ],
    },
    {
      title: "Website",
      items: [
        { href: "/admin/navigation", label: "Navigation & footer", icon: Navigation },
        { href: "/admin/settings", label: "Website settings", icon: Settings },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/admin/account", label: "My account", icon: UserCircle },
        { href: "/admin/administrators", label: "Administrators", icon: ShieldCheck },
        { href: "/admin/activity", label: "Activity history", icon: History },
      ],
    },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {groups.map((g) => (
        <div key={g.title || "main"}>
          {g.title ? <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-white/40 uppercase">{g.title}</p> : null}
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                      active ? "bg-white/12 font-semibold text-white" : "text-white/70 hover:bg-white/6 hover:text-white",
                    )}
                  >
                    <item.icon className={cn("size-4 shrink-0", active ? "text-sage" : "")} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-sage px-1.5 py-0.5 text-[10px] font-bold text-forest tabular-nums" aria-label={`${item.badge} new`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 p-3">
      <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/6 hover:text-white">
        <ExternalLink className="size-4" /> View website
      </Link>
      <form action={signOut}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/6 hover:text-white">
          <LogOut className="size-4" /> Sign out
        </button>
      </form>
      <p className="mt-2 truncate px-3 text-xs text-white/40" title={userLabel}>
        {userLabel}
      </p>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5 text-white">
      <LogoMark className="size-8 text-sage" />
      <span className="leading-tight">
        <span className="block font-display text-base font-extrabold tracking-wider">ABC</span>
        <span className="block text-[10px] tracking-wider text-white/50 uppercase">Content manager</span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-forest px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-white">
          <LogoMark className="size-7 text-sage" />
          <span className="font-display font-extrabold tracking-wider">ABC Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-white hover:bg-white/10"
          aria-label="Open admin menu"
          aria-expanded={open}
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] animate-fade-in flex-col bg-forest">
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white hover:bg-white/10" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-forest lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>
    </>
  );
}
