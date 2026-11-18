"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import type { Programme } from "@/lib/types";
import { saveRecord } from "@/lib/actions/admin/records";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldHelp, Input, Label, Select, Switch, Textarea } from "@/components/ui/form-controls";
import { AdminPageHeader, SaveBar, useAction } from "@/components/admin/primitives";
import { EditorLayout, Panel } from "@/components/admin/editor-layout";
import { ImageField } from "@/components/admin/media/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { IconPicker } from "@/components/admin/fields-editor";
import { useDirty } from "@/components/admin/use-dirty";

export function ProgrammeEditor({ initial }: { initial: Programme }) {
  const router = useRouter();
  const isNew = !initial.id;
  const [p, setP] = React.useState(initial);
  const [slugTouched, setSlugTouched] = React.useState(!isNew);
  const { dirty, markSaved } = useDirty(p);
  const { run, pending } = useAction();
  const set = <K extends keyof Programme>(k: K, v: Programme[K]) => setP((x) => ({ ...x, [k]: v }));

  async function save() {
    const { created_at: _c, updated_at: _u, ...values } = p;
    void _c;
    void _u;
    const res = await run(saveRecord("programmes", { ...values, id: p.id || undefined }), { refresh: !isNew });
    if (res.ok) {
      markSaved(p);
      if (isNew && res.data?.id) router.replace(`/admin/programmes/${res.data.id}`);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow={
          <Link href="/admin/programmes" className="inline-flex items-center gap-1 hover:text-charcoal">
            <ChevronLeft className="size-3.5" /> All programmes
          </Link>
        }
        title={isNew ? "New programme" : p.title || "Untitled programme"}
        actions={
          !isNew && initial.is_published ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/programmes/${initial.slug}`} target="_blank">
                <ExternalLink /> View
              </Link>
            </Button>
          ) : null
        }
      />
      <EditorLayout
        main={
          <Panel title="Content">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={p.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
            </div>
            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" rows={3} value={p.summary} onChange={(e) => set("summary", e.target.value)} />
              <FieldHelp>Shown on programme cards and at the top of the programme page.</FieldHelp>
            </div>
            <div>
              <Label>Detailed description</Label>
              <RichTextEditor value={p.description} onChange={(v) => set("description", v)} />
            </div>
          </Panel>
        }
        side={
          <>
            <Panel title="Publishing">
              <Switch label="Published" description="Visible on the website" checked={p.is_published} onCheckedChange={(v) => set("is_published", v)} />
              <Switch label="Featured" description="Shown where only featured programmes are listed" checked={p.is_featured} onCheckedChange={(v) => set("is_featured", v)} />
              <div>
                <Label htmlFor="status">Programme status</Label>
                <Select id="status" value={p.status} onChange={(e) => set("status", e.target.value as Programme["status"])}>
                  <option value="proposed">Proposed programme area</option>
                  <option value="pilot">Pilot phase</option>
                  <option value="active">Active programme</option>
                  <option value="completed">Completed</option>
                </Select>
                <FieldHelp>Only mark a programme active or completed when that is verifiably true.</FieldHelp>
              </div>
              <div>
                <Label htmlFor="slug">Web address</Label>
                <div className="flex items-center rounded-lg border border-input bg-muted/40 pl-3 text-sm text-muted-foreground">
                  /programmes/
                  <input
                    id="slug"
                    value={p.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                    className="h-10 min-w-0 flex-1 bg-transparent pr-3 text-charcoal focus:outline-none"
                  />
                </div>
              </div>
            </Panel>
            <Panel title="Presentation">
              <ImageField label="Cover photograph" value={p.cover_image} onChange={(v) => set("cover_image", v)} />
              <IconPicker label="Icon" value={p.icon} onChange={(v) => set("icon", v)} />
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={p.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Learning" />
              </div>
            </Panel>
            <Panel title="Search and sharing">
              <div>
                <Label htmlFor="seo_title">SEO title</Label>
                <Input id="seo_title" value={p.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder={p.title} />
              </div>
              <div>
                <Label htmlFor="seo_description">SEO description</Label>
                <Textarea id="seo_description" rows={3} value={p.seo_description} onChange={(e) => set("seo_description", e.target.value)} placeholder={p.summary} />
              </div>
            </Panel>
          </>
        }
      />
      <SaveBar dirty={dirty || isNew} saving={pending} onSave={save} label={isNew ? "Create programme" : "Save programme"} />
    </>
  );
}
