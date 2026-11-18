"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ExternalLink, FileVideo, ImagePlus, X } from "lucide-react";
import type { Article, ArticleCategory } from "@/lib/types";
import { saveRecord } from "@/lib/actions/admin/records";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldHelp, Input, Label, Select, Switch, Textarea } from "@/components/ui/form-controls";
import { AdminPageHeader, MoveButtons, SaveBar, moveItem, useAction } from "@/components/admin/primitives";
import { EditorLayout, Panel } from "@/components/admin/editor-layout";
import { ImageField } from "@/components/admin/media/image-field";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { useDirty } from "@/components/admin/use-dirty";

/** Converts an ISO timestamp to a value for <input type="datetime-local"> in local time. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function StoryEditor({ initial, categories }: { initial: Article; categories: ArticleCategory[] }) {
  const router = useRouter();
  const isNew = !initial.id;
  const [a, setA] = React.useState(initial);
  const [slugTouched, setSlugTouched] = React.useState(!isNew);
  const [galleryOpen, setGalleryOpen] = React.useState(false);
  const [videoOpen, setVideoOpen] = React.useState(false);
  const { dirty, markSaved } = useDirty(a);
  const { run, pending } = useAction();
  const set = <K extends keyof Article>(k: K, v: Article[K]) => setA((x) => ({ ...x, [k]: v }));

  async function save(statusOverride?: Article["status"]) {
    const next = statusOverride ? { ...a, status: statusOverride } : a;
    const { category: _cat, created_at: _c, updated_at: _u, ...values } = next;
    void _cat;
    void _c;
    void _u;
    const res = await run(saveRecord("articles", { ...values, id: next.id || undefined }), { refresh: !isNew });
    if (res.ok) {
      setA(next);
      markSaved(next);
      if (isNew && res.data?.id) router.replace(`/admin/stories/${res.data.id}`);
    }
  }

  const scheduled = a.status === "published" && a.published_at && new Date(a.published_at) > new Date();

  return (
    <>
      <AdminPageHeader
        eyebrow={
          <Link href="/admin/stories" className="inline-flex items-center gap-1 hover:text-charcoal">
            <ChevronLeft className="size-3.5" /> All stories
          </Link>
        }
        title={isNew ? "New story" : a.title || "Untitled story"}
        actions={
          !isNew && initial.status === "published" ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/stories/${initial.slug}`} target="_blank">
                <ExternalLink /> View story
              </Link>
            </Button>
          ) : null
        }
      />
      <EditorLayout
        main={
          <>
            <Panel title="Story">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={a.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    if (!slugTouched) set("slug", slugify(e.target.value));
                  }}
                  className="text-base font-medium"
                />
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea id="excerpt" rows={2} value={a.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
                <FieldHelp>A short summary shown on story cards and at the top of the story.</FieldHelp>
              </div>
              <div>
                <Label>Content</Label>
                <RichTextEditor value={a.content} onChange={(v) => set("content", v)} placeholder="Write your story" />
              </div>
            </Panel>

            <Panel title="Photo gallery" description="Optional photographs shown after the story.">
              {a.gallery.length ? (
                <ul className="space-y-2">
                  {a.gallery.map((img, i) => (
                    <li key={`${img.src}-${i}`} className="flex items-center gap-3 rounded-xl border border-border p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                      <img src={img.src} alt="" className="h-12 w-16 rounded-lg object-cover" />
                      <Input
                        value={img.alt}
                        onChange={(e) => set("gallery", a.gallery.map((g, j) => (j === i ? { ...g, alt: e.target.value } : g)))}
                        placeholder="Alternative text"
                        aria-label={`Alternative text for gallery image ${i + 1}`}
                        className="h-9 flex-1"
                      />
                      <MoveButtons index={i} count={a.gallery.length} onMove={(f, t) => set("gallery", moveItem(a.gallery, f, t))} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove image"
                        onClick={() => set("gallery", a.gallery.filter((_, j) => j !== i))}
                      >
                        <X />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Button type="button" variant="outline" size="sm" onClick={() => setGalleryOpen(true)}>
                <ImagePlus /> Add photograph
              </Button>
              <MediaPicker
                open={galleryOpen}
                onOpenChange={setGalleryOpen}
                onSelect={(m) => set("gallery", [...a.gallery, { src: m.url, alt: m.alt_text, credit: m.credit }])}
              />
            </Panel>

            <Panel title="Video" description="Paste a YouTube or Vimeo link, or choose an uploaded video file.">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={a.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." aria-label="Video URL" />
                <Button type="button" variant="outline" className="h-11 shrink-0 rounded-lg" onClick={() => setVideoOpen(true)}>
                  <FileVideo /> Choose file
                </Button>
              </div>
              <MediaPicker kind="video" open={videoOpen} onOpenChange={setVideoOpen} onSelect={(m) => set("video_url", m.url)} />
            </Panel>
          </>
        }
        side={
          <>
            <Panel title="Publishing">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={a.status} onChange={(e) => set("status", e.target.value as Article["status"])}>
                  <option value="draft">Draft (not visible)</option>
                  <option value="published">Published</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="published_at">Publication date</Label>
                <Input
                  id="published_at"
                  type="datetime-local"
                  value={toLocalInput(a.published_at)}
                  onChange={(e) => set("published_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
                <FieldHelp>
                  {scheduled ? "Scheduled: it will appear automatically at this time." : "Leave empty to use the moment you publish."}
                </FieldHelp>
              </div>
              <Switch label="Featured story" checked={a.is_featured} onCheckedChange={(v) => set("is_featured", v)} />
              {a.status === "draft" ? (
                <Button type="button" variant="sage" className="w-full" disabled={pending} onClick={() => save("published")}>
                  Save and publish
                </Button>
              ) : null}
            </Panel>
            <Panel title="Details">
              <ImageField label="Featured photograph" value={a.featured_image} onChange={(v) => set("featured_image", v)} />
              <div>
                <Label htmlFor="category">Category</Label>
                <Select id="category" value={a.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}>
                  <option value="">Uncategorised</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={a.author_name} onChange={(e) => set("author_name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="slug">Web address</Label>
                <div className="flex items-center rounded-lg border border-input bg-muted/40 pl-3 text-sm text-muted-foreground">
                  /stories/
                  <input
                    id="slug"
                    value={a.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                    className="h-10 min-w-0 flex-1 bg-transparent pr-3 text-charcoal focus:outline-none"
                  />
                </div>
              </div>
            </Panel>
            <Panel title="Search and sharing">
              <div>
                <Label htmlFor="seo_title">SEO title</Label>
                <Input id="seo_title" value={a.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder={a.title} />
              </div>
              <div>
                <Label htmlFor="seo_description">SEO description</Label>
                <Textarea id="seo_description" rows={3} value={a.seo_description} onChange={(e) => set("seo_description", e.target.value)} placeholder={a.excerpt} />
                <FieldHelp>{a.seo_description.length}/160 characters recommended</FieldHelp>
              </div>
            </Panel>
          </>
        }
      />
      <SaveBar dirty={dirty || isNew} saving={pending} onSave={() => save()} label={isNew ? "Create story" : "Save story"} />
    </>
  );
}
