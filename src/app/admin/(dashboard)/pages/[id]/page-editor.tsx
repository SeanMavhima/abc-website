"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink, Lock } from "lucide-react";
import type { Page } from "@/lib/types";
import { savePage } from "@/lib/actions/admin/content";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldHelp, Input, Label, Select, Textarea } from "@/components/ui/form-controls";
import { AdminPageHeader, SaveBar, useAction } from "@/components/admin/primitives";
import { EditorLayout, Panel } from "@/components/admin/editor-layout";
import { ImageField } from "@/components/admin/media/image-field";
import { SectionsEditor } from "@/components/admin/sections-editor";
import { useDirty } from "@/components/admin/use-dirty";
import { BLOCK_TYPES } from "@/lib/blocks";

export function PageEditor({ initial }: { initial: Page }) {
  const router = useRouter();
  const isNew = !initial.id;
  const [page, setPage] = React.useState<Page>(initial);
  const [slugTouched, setSlugTouched] = React.useState(!isNew);
  const { dirty, markSaved } = useDirty(page);
  const { run, pending } = useAction();
  const set = <K extends keyof Page>(key: K, value: Page[K]) => setPage((p) => ({ ...p, [key]: value }));

  async function save() {
    const res = await run(savePage({ ...page, id: page.id || undefined }), { refresh: !isNew });
    if (res.ok) {
      markSaved(page);
      if (isNew && res.data?.id) router.replace(`/admin/pages/${res.data.id}`);
    }
  }

  const publicPath = `/${page.slug}`;

  return (
    <>
      <AdminPageHeader
        eyebrow={
          <Link href="/admin/pages" className="inline-flex items-center gap-1 hover:text-charcoal">
            <ChevronLeft className="size-3.5" /> All pages
          </Link>
        }
        title={isNew ? "New page" : page.title || "Untitled page"}
        actions={
          !isNew && initial.status === "published" ? (
            <Button asChild variant="outline" size="sm">
              <Link href={publicPath} target="_blank">
                <ExternalLink /> View page
              </Link>
            </Button>
          ) : null
        }
      />
      <EditorLayout
        main={
          <>
            <Panel title="Page header" description="The photographic banner at the top of the page.">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={page.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    if (!slugTouched) set("slug", slugify(e.target.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="eyebrow">Eyebrow</Label>
                <Input id="eyebrow" value={page.hero_eyebrow} onChange={(e) => set("hero_eyebrow", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="description">Introduction</Label>
                <Textarea id="description" rows={3} value={page.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <ImageField label="Header photograph" value={page.hero_image} onChange={(v) => set("hero_image", v)} />
            </Panel>
            <div>
              <h2 className="mb-3 font-display text-lg font-semibold">Sections</h2>
              <SectionsEditor
                value={page.sections}
                onChange={(s) => set("sections", s)}
                allowedTypes={BLOCK_TYPES.filter((t) => t !== "hero")}
              />
            </div>
          </>
        }
        side={
          <>
            <Panel title="Publishing">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={page.status} onChange={(e) => set("status", e.target.value as Page["status"])}>
                  <option value="draft">Draft (not visible)</option>
                  <option value="published">Published</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="slug">Web address</Label>
                <div className="flex items-center gap-1 rounded-lg border border-input bg-muted/40 pl-3 text-sm text-muted-foreground focus-within:border-evergreen">
                  /
                  <input
                    id="slug"
                    value={page.slug}
                    disabled={initial.is_system}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                    className="h-10 min-w-0 flex-1 bg-transparent pr-3 text-charcoal focus:outline-none disabled:text-muted-foreground"
                  />
                  {initial.is_system ? <Lock className="mr-3 size-3.5" /> : null}
                </div>
                <FieldHelp>{initial.is_system ? "Core page addresses are fixed." : "Lowercase letters, numbers and hyphens."}</FieldHelp>
              </div>
            </Panel>
            <Panel title="Search and sharing" description="Optional. Defaults to the title and introduction.">
              <div>
                <Label htmlFor="seo_title">SEO title</Label>
                <Input id="seo_title" value={page.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder={page.title} />
              </div>
              <div>
                <Label htmlFor="seo_description">SEO description</Label>
                <Textarea id="seo_description" rows={3} value={page.seo_description} onChange={(e) => set("seo_description", e.target.value)} placeholder={page.description} />
                <FieldHelp>{page.seo_description.length}/160 characters recommended</FieldHelp>
              </div>
            </Panel>
          </>
        }
      />
      <SaveBar dirty={dirty || isNew} saving={pending} onSave={save} label={isNew ? "Create page" : "Save page"} />
    </>
  );
}
