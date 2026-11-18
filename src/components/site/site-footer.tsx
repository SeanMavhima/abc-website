import Link from "next/link";
import { Facebook, Globe, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube, type LucideIcon } from "lucide-react";
import type { NavTreeItem, SiteSettings } from "@/lib/types";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Logo } from "./logo";
import { ImmersiveToggle } from "./immersive-toggle";
import { MotionToggle } from "./motion-toggle";
import { SmartLink } from "./smart-link";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
};

export function socialIcon(platform: string): LucideIcon {
  return SOCIAL_ICONS[platform.toLowerCase().trim()] ?? Globe;
}

export function SiteFooter({ settings, columns }: { settings: SiteSettings; columns: NavTreeItem[] }) {
  const year = new Date().getFullYear();
  const copyright = (settings.copyright_text || `© {year} ${settings.org_name}`).replace("{year}", String(year));
  const hasContact = settings.contact_email || settings.contact_phone || settings.address;

  return (
    <footer className="relative overflow-hidden bg-forest text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-evergreen/40 blur-3xl"
      />
      <div className="container-site relative pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block" aria-label={`${settings.org_name}: home`}>
              <Logo settings={settings} tone="light" />
            </Link>
            {settings.footer_description ? (
              <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-white/70">{settings.footer_description}</p>
            ) : null}
            {settings.tagline ? (
              <p className="mt-6 font-display text-lg font-medium text-sage">{settings.tagline}</p>
            ) : null}

            {hasContact ? (
              <ul className="mt-8 space-y-3 text-sm text-white/75">
                {settings.contact_email ? (
                  <li>
                    <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-3 hover:text-white">
                      <Mail className="size-4 text-sage" /> {settings.contact_email}
                    </a>
                  </li>
                ) : null}
                {settings.contact_phone ? (
                  <li>
                    <a href={`tel:${settings.contact_phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-3 hover:text-white">
                      <Phone className="size-4 text-sage" /> {settings.contact_phone}
                    </a>
                  </li>
                ) : null}
                {settings.address ? (
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-sage" />
                    <span className="whitespace-pre-line">{settings.address}</span>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-7 lg:col-start-6">
            {columns.map((col) => (
              <div key={col.id}>
                <h2 className="eyebrow text-sage">{col.label}</h2>
                <ul className="mt-5 space-y-3">
                  {col.children.map((link) => (
                    <li key={link.id}>
                      <SmartLink
                        href={link.href || "/"}
                        newTab={link.open_in_new_tab}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

        </div>

        {settings.newsletter_enabled ? (
          <div className="mt-16 grid gap-6 rounded-md bg-white/[0.04] p-6 ring-1 ring-white/10 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-7">
              <h2 className="font-display text-2xl font-medium">{settings.newsletter_heading || "Newsletter"}</h2>
              {settings.newsletter_text ? (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">{settings.newsletter_text}</p>
              ) : null}
            </div>
            <div className="lg:col-span-5">
              <NewsletterForm />
            </div>
          </div>
        ) : null}

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/50">{copyright}</p>
          <div className="flex flex-wrap items-center gap-3">
            {settings.social_links.length > 0 ? (
              <ul className="flex items-center gap-2">
                {settings.social_links.map((s) => {
                  const Icon = socialIcon(s.platform);
                  return (
                    <li key={`${s.platform}-${s.url}`}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.platform}
                        className="flex size-9 items-center justify-center rounded-full text-white/70 ring-1 ring-white/15 transition hover:bg-white hover:text-forest"
                      >
                        <Icon className="size-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <ImmersiveToggle />
            <MotionToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
