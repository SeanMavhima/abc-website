import { Mail, MapPin, Phone, Plus } from "lucide-react";
import type { ImageRef, LinkRef, SiteSettings } from "@/lib/types";
import { arr, bool, cn, str } from "@/lib/utils";
import { Reveal } from "@/components/site/reveal";
import { LogoMark } from "@/components/site/logo";
import { SmartImage } from "@/components/site/smart-image";
import { SmartLink } from "@/components/site/smart-link";
import { socialIcon } from "@/components/site/site-footer";
import { ContactForm } from "@/components/forms/contact-form";
import { VolunteerForm } from "@/components/forms/volunteer-form";
import { ArrowLink, RichText, SectionHeading, SectionShell, hasLink, isDark } from "./shared";

type Data = { data: Record<string, unknown> };

/* ------------------------------------------------------------------ */

export function RichTextBlock({ data }: Data) {
  const dark = isDark(data.background);
  const wide = str(data.width) === "wide";
  const eyebrow = str(data.eyebrow);
  const heading = str(data.heading);
  return (
    <SectionShell id={str(data.anchor)} background={data.background}>
      <div className={cn("container-site", wide ? "grid gap-10 lg:grid-cols-12" : "")}>
        {eyebrow || heading ? (
          <Reveal className={cn(wide ? "lg:col-span-4" : "mx-auto mb-10 max-w-3xl")}>
            {eyebrow ? (
              <p className={cn("eyebrow flex items-center gap-3", dark ? "text-sage" : "text-earth")}>
                <span className={cn("h-px w-8", dark ? "bg-sage/60" : "bg-earth/50")} aria-hidden="true" />
                {eyebrow}
              </p>
            ) : null}
            {heading ? (
              <h2 className={cn("mt-4 font-display text-3xl leading-tight font-medium sm:text-4xl", dark ? "text-white" : "text-forest")}>
                {heading}
              </h2>
            ) : null}
          </Reveal>
        ) : null}
        <Reveal className={cn(wide ? "lg:col-span-8" : "mx-auto max-w-3xl")} delay={0.1}>
          <RichText html={str(data.body)} dark={dark} />
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */

export function StatementBlock({ data }: Data) {
  const text = str(data.text);
  if (!text) return null;
  const dark = isDark(data.background);
  return (
    <SectionShell id={str(data.anchor)} background={data.background} className="overflow-hidden sm:py-32">
      <LogoMark
        className={cn(
          "pointer-events-none absolute top-1/2 -right-24 size-[28rem] -translate-y-1/2",
          dark ? "text-white/[0.04]" : "text-forest/[0.04]",
        )}
      />
      <div className="container-site relative">
        <Reveal className="mx-auto max-w-5xl text-center">
          {str(data.eyebrow) ? <p className={cn("eyebrow", dark ? "text-sage" : "text-earth")}>{str(data.eyebrow)}</p> : null}
          <p
            className={cn(
              "mt-8 font-display text-2xl leading-[1.3] font-medium tracking-[-0.02em] sm:text-3xl lg:text-[2.6rem] lg:leading-[1.25]",
              dark ? "text-white" : "text-forest",
            )}
          >
            {text}
          </p>
          {str(data.attribution) ? (
            <p className={cn("mt-8 text-sm font-medium", dark ? "text-white/60" : "text-charcoal/60")}>{str(data.attribution)}</p>
          ) : null}
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */

export function CtaBlock({ data }: Data) {
  const image = data.image as ImageRef | null;
  const primary = data.primary as LinkRef;
  const secondary = data.secondary as LinkRef;
  return (
    <section id={str(data.anchor) || undefined} className="bg-ivory px-3 py-6 sm:px-6 sm:py-10">
      <Reveal className="relative isolate mx-auto max-w-[90rem] overflow-hidden rounded-md bg-forest text-white sm:rounded-[2.5rem]">
        {image?.src ? (
          <>
            <SmartImage image={image} fill sizes="100vw" className="-z-20" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest/95 via-forest/75 to-forest/35" />
          </>
        ) : (
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,var(--brand-evergreen),transparent_65%)]" />
        )}
        <div className="px-6 py-20 sm:px-14 sm:py-24 lg:px-20 lg:py-28">
          <div className="max-w-2xl">
            {str(data.eyebrow) ? <p className="eyebrow text-sage">{str(data.eyebrow)}</p> : null}
            <h2 className="mt-4 font-display text-3xl leading-[1.08] font-medium sm:text-4xl lg:text-5xl">{str(data.heading)}</h2>
            {str(data.text) ? <p className="mt-5 text-lg leading-relaxed text-white/80">{str(data.text)}</p> : null}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {hasLink(primary) ? <ArrowLink link={primary} dark /> : null}
              {hasLink(secondary) ? (
                <SmartLink
                  href={secondary.href}
                  className="inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-semibold ring-1 ring-white/40 transition hover:bg-white/10 hover:ring-white"
                >
                  {secondary.label}
                </SmartLink>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function FaqBlock({ data }: Data) {
  const items = arr<{ question?: string; answer?: string }>(data.items).filter((i) => i.question);
  if (items.length === 0) return null;
  return (
    <SectionShell id={str(data.anchor)} background="white">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} className="mb-0 sm:mb-0" />
        </div>
        <Reveal className="lg:col-span-8">
          <div className="divide-y divide-forest/10 border-y border-forest/10">
            {items.map((item, i) => (
              <details key={`${item.question}-${i}`} className="group py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-display text-lg font-medium text-forest [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage/25 transition-transform duration-300 group-open:rotate-45">
                    <Plus className="size-4" />
                  </span>
                </summary>
                <p className="pr-14 pb-5 leading-relaxed whitespace-pre-line text-charcoal/75">{item.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */

export function GalleryBlock({ data }: Data) {
  const images = arr<{ image?: ImageRef | null }>(data.images)
    .map((i) => i.image)
    .filter((i): i is ImageRef => Boolean(i?.src));
  if (images.length === 0) return null;
  return (
    <SectionShell id={str(data.anchor)} background="ivory">
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} />
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {images.map((img, i) => (
            <Reveal as="li" key={`${img.src}-${i}`} delay={(i % 3) * 0.08} className="mb-4 break-inside-avoid">
              <figure className="group overflow-hidden rounded-md bg-forest">
                <SmartImage
                  image={img}
                  width={900}
                  height={i % 3 === 1 ? 1100 : 700}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-[1400ms] group-hover:scale-105"
                />
                {img.credit ? <figcaption className="sr-only">Photo: {img.credit}</figcaption> : null}
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */

export function ContactDetailsBlock({ data, settings }: Data & { settings: SiteSettings }) {
  const items = [
    settings.contact_email && {
      icon: Mail,
      label: "Email",
      value: settings.contact_email,
      href: `mailto:${settings.contact_email}`,
    },
    settings.contact_phone && {
      icon: Phone,
      label: "Phone",
      value: settings.contact_phone,
      href: `tel:${settings.contact_phone.replace(/\s/g, "")}`,
    },
    (settings.address || settings.location_note) && {
      icon: MapPin,
      label: "Location",
      value: [settings.address, settings.location_note].filter(Boolean).join("\n"),
      href: "",
    },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string }[];
  const showSocial = bool(data.show_social, true) && settings.social_links.length > 0;

  return (
    <SectionShell id={str(data.anchor)} background="ivory" className="pb-6 sm:pb-8">
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} />
        {items.length === 0 && !showSocial ? (
          <Reveal className="max-w-2xl rounded-md bg-white p-7 ring-1 ring-forest/8">
            <p className="leading-relaxed text-charcoal/75">
              Our public contact details will be published here once they are confirmed. In the meantime, please use the form
              below and we will reply by email.
            </p>
          </Reveal>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => {
              const Icon = item.icon;
              const inner = (
                <>
                  <span className="flex size-12 items-center justify-center rounded-md bg-sage/25 text-forest">
                    <Icon className="size-5" />
                  </span>
                  <span className="mt-6 block text-xs font-semibold tracking-[0.16em] text-earth uppercase">{item.label}</span>
                  <span className="mt-2 block font-display text-lg font-medium break-words whitespace-pre-line text-forest">
                    {item.value}
                  </span>
                </>
              );
              return (
                <Reveal as="li" key={item.label} delay={i * 0.08}>
                  {item.href ? (
                    <a href={item.href} className="block h-full rounded-md bg-white p-7 ring-1 ring-forest/8 transition hover:-translate-y-1 hover:shadow-lg">
                      {inner}
                    </a>
                  ) : (
                    <div className="h-full rounded-md bg-white p-7 ring-1 ring-forest/8">{inner}</div>
                  )}
                </Reveal>
              );
            })}
            {showSocial ? (
              <Reveal as="li" delay={items.length * 0.08}>
                <div className="h-full rounded-md bg-forest p-7 text-white">
                  <span className="block text-xs font-semibold tracking-[0.16em] text-sage uppercase">Follow ABC</span>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {settings.social_links.map((s) => {
                      const Icon = socialIcon(s.platform);
                      return (
                        <li key={s.url}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white hover:text-forest"
                          >
                            <Icon className="size-4" /> {s.platform}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            ) : null}
          </ul>
        )}
      </div>
    </SectionShell>
  );
}

/* ------------------------------------------------------------------ */

export function FormBlock({ data }: Data) {
  const image = data.image as ImageRef | null;
  const kind = str(data.form, "contact");
  return (
    <SectionShell id={str(data.anchor)} background="ivory">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} className="mb-8 sm:mb-10" />
          {image?.src ? (
            <Reveal className="relative hidden aspect-[4/5] overflow-hidden rounded-md lg:block">
              <SmartImage image={image} fill sizes="40vw" />
            </Reveal>
          ) : null}
        </div>
        <Reveal className="lg:col-span-7" delay={0.1}>
          <div className="rounded-md bg-white p-6 shadow-[0_30px_80px_-40px_rgba(23,61,50,0.35)] ring-1 ring-forest/8 sm:p-10">
            {kind === "volunteer" ? <VolunteerForm /> : <ContactForm />}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
