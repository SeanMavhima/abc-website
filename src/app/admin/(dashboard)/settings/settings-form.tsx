"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import type { BrandColors, SiteSettings } from "@/lib/types";
import type { Field } from "@/lib/blocks";
import { saveSettings } from "@/lib/actions/admin/site";
import { Button } from "@/components/ui/button";
import { FieldHelp, Input, Label, Switch, Textarea } from "@/components/ui/form-controls";
import { SaveBar, useAction } from "@/components/admin/primitives";
import { Panel } from "@/components/admin/editor-layout";
import { ImageField } from "@/components/admin/media/image-field";
import { FieldInput } from "@/components/admin/fields-editor";
import { useDirty } from "@/components/admin/use-dirty";

const DEFAULT_COLORS: BrandColors = {
  forest: "#173D32",
  evergreen: "#245443",
  sage: "#A8B99B",
  ivory: "#F7F7F0",
  earth: "#795C43",
  charcoal: "#202923",
};

const COLOR_LABELS: Record<keyof BrandColors, string> = {
  forest: "Deep forest (primary)",
  evergreen: "Evergreen (accent)",
  sage: "Sage (highlight)",
  ivory: "Ivory (background)",
  earth: "Earth (warm accent)",
  charcoal: "Charcoal (text)",
};

const socialField: Field = {
  kind: "list",
  name: "social_links",
  label: "Social media links",
  itemLabel: "Link",
  titleField: "platform",
  help: "Recognised platforms show their icon: Facebook, Instagram, LinkedIn, X, YouTube. Others show a globe.",
  fields: [
    { kind: "text", name: "platform", label: "Platform", placeholder: "e.g. LinkedIn" },
    { kind: "text", name: "url", label: "Full web address", placeholder: "https://..." },
  ],
  newItem: { platform: "", url: "" },
};

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [s, setS] = React.useState(initial);
  const { dirty, markSaved } = useDirty(s);
  const { run, pending } = useAction();
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const text = (k: keyof SiteSettings, label: string, opts: { help?: string; placeholder?: string; type?: string } = {}) => (
    <div>
      <Label htmlFor={`s-${k}`}>{label}</Label>
      <Input
        id={`s-${k}`}
        type={opts.type}
        value={(s[k] as string) ?? ""}
        placeholder={opts.placeholder}
        onChange={(e) => set(k, e.target.value as never)}
      />
      {opts.help ? <FieldHelp>{opts.help}</FieldHelp> : null}
    </div>
  );
  const area = (k: keyof SiteSettings, label: string, help?: string) => (
    <div>
      <Label htmlFor={`s-${k}`}>{label}</Label>
      <Textarea id={`s-${k}`} rows={3} value={(s[k] as string) ?? ""} onChange={(e) => set(k, e.target.value as never)} />
      {help ? <FieldHelp>{help}</FieldHelp> : null}
    </div>
  );

  async function save() {
    const { updated_at: _u, ...values } = s;
    void _u;
    const res = await run(saveSettings(values));
    if (res.ok) markSaved(s);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Organisation">
          {text("org_name", "Organisation name")}
          {text("short_name", "Short name", { help: "Used in the logo wordmark and page titles, e.g. ABC." })}
          {text("tagline", "Tagline")}
          {area("description", "Short description", "Used in structured data for search engines.")}
        </Panel>

        <Panel title="Logo and favicon">
          <ImageField label="Logo" value={s.logo} onChange={(v) => set("logo", v)} help="Optional. Without a logo the built-in ABC mark and wordmark are used. SVG or transparent PNG works best." />
          <ImageField
            label="Favicon"
            value={s.favicon_url ? { src: s.favicon_url, alt: "" } : null}
            onChange={(v) => set("favicon_url", v?.src ?? null)}
            help="Optional square image (at least 64 × 64). Without one the built-in icon is used."
            compact
          />
        </Panel>
      </div>

      <Panel title="Brand colours" description="Changes apply across the whole website. Keep strong contrast between text and backgrounds.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(COLOR_LABELS) as (keyof BrandColors)[]).map((k) => (
            <div key={k}>
              <Label htmlFor={`c-${k}`}>{COLOR_LABELS[k]}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={`${COLOR_LABELS[k]} picker`}
                  value={/^#[0-9a-f]{6}$/i.test(s.brand_colors[k]) ? s.brand_colors[k] : DEFAULT_COLORS[k]}
                  onChange={(e) => set("brand_colors", { ...s.brand_colors, [k]: e.target.value.toUpperCase() })}
                  className="h-11 w-14 cursor-pointer rounded-lg border border-input bg-white p-1"
                />
                <Input
                  id={`c-${k}`}
                  value={s.brand_colors[k]}
                  onChange={(e) => set("brand_colors", { ...s.brand_colors, [k]: e.target.value })}
                  className="font-mono uppercase"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-lg ring-1 ring-border" aria-hidden="true">
            {(Object.keys(COLOR_LABELS) as (keyof BrandColors)[]).map((k) => (
              <span key={k} className="h-8 w-10" style={{ background: s.brand_colors[k] }} />
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => set("brand_colors", DEFAULT_COLORS)}>
            <RotateCcw /> Restore ABC colours
          </Button>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Search and sharing defaults">
          {text("seo_title", "Default page title")}
          {area("seo_description", "Default description", `${s.seo_description.length}/160 characters recommended`)}
          <ImageField label="Default sharing image" value={s.og_image} onChange={(v) => set("og_image", v)} help="Shown when pages are shared on social media. 1200 × 630 recommended." />
        </Panel>

        <Panel title="Contact details" description="Only publish confirmed details. Empty fields are hidden on the website.">
          {text("contact_email", "Public email address", { type: "email", placeholder: "hello@example.org" })}
          {text("contact_phone", "Phone number")}
          {area("address", "Address")}
          {text("location_note", "Location note", { placeholder: "e.g. Based in Kigali, Rwanda" })}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Social media">
          <FieldInput field={socialField} value={s.social_links} onChange={(v) => set("social_links", v as SiteSettings["social_links"])} />
        </Panel>
        <Panel title="Header button">
          {text("header_cta_label", "Button text", { help: "Leave empty to hide the header button." })}
          {text("header_cta_href", "Button destination", { placeholder: "/get-involved" })}
        </Panel>
      </div>

      <Panel title="Footer and newsletter">
        <div className="grid gap-5 lg:grid-cols-2">
          {area("footer_description", "Footer description")}
          {text("copyright_text", "Copyright text", { help: "Use {year} to insert the current year automatically." })}
        </div>
        <Switch label="Show newsletter sign-up" checked={s.newsletter_enabled} onCheckedChange={(v) => set("newsletter_enabled", v)} />
        <div className="grid gap-5 lg:grid-cols-2">
          {text("newsletter_heading", "Newsletter heading")}
          {area("newsletter_text", "Newsletter text")}
        </div>
      </Panel>

      <Panel title="Community observations">
        <Switch
          label="Accept observation submissions from the public"
          description="Shows the observation form on any page that has a Community observations section. Every submission waits in Admin, Observations, until you approve or reject it. Leave this off until someone is ready to review submissions regularly."
          checked={s.observations_open}
          onCheckedChange={(v) => set("observations_open", v)}
        />
      </Panel>

      <SaveBar dirty={dirty} saving={pending} onSave={save} label="Save settings" />
    </div>
  );
}
