"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, FileVideo, Images, Loader2, Search, Trash2, Upload } from "lucide-react";
import type { MediaAsset } from "@/lib/types";
import { deleteMedia, getMediaUsage, updateMedia } from "@/lib/actions/admin/media";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldHelp, Input, Label, Textarea } from "@/components/ui/form-controls";
import { EmptyState, useAction } from "@/components/admin/primitives";
import { useMediaUpload } from "@/components/admin/media/use-media-upload";

export function MediaLibrary({ initial }: { initial: MediaAsset[] }) {
  const [items, setItems] = React.useState(initial);
  const [q, setQ] = React.useState("");
  const [folder, setFolder] = React.useState("");
  const [type, setType] = React.useState<"" | "image" | "video">("");
  const [uploadFolder, setUploadFolder] = React.useState("General");
  const [dragging, setDragging] = React.useState(false);
  const [selected, setSelected] = React.useState<MediaAsset | null>(null);
  const { upload, uploading } = useMediaUpload();
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setItems(initial), [initial]);

  const folders = React.useMemo(() => Array.from(new Set(items.map((i) => i.folder))).sort(), [items]);
  const filtered = items.filter((i) => {
    if (folder && i.folder !== folder) return false;
    if (type && !i.mime_type.startsWith(`${type}/`)) return false;
    if (!q) return true;
    return `${i.file_name} ${i.alt_text} ${i.caption} ${i.credit}`.toLowerCase().includes(q.toLowerCase());
  });

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const uploaded = await upload(Array.from(files), { folder: uploadFolder.trim() || "General" });
    if (uploaded.length) {
      setItems((prev) => [...uploaded, ...prev]);
      if (uploaded.length === 1) setSelected(uploaded[0]);
    }
  }

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void onFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mb-6 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed bg-white px-6 py-8 text-center transition sm:flex-row sm:text-left",
          dragging ? "border-evergreen bg-sage/10" : "border-border",
        )}
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sage/25 text-forest">
          {uploading ? <Loader2 className="size-6 animate-spin" /> : <Upload className="size-6" />}
        </span>
        <div className="flex-1">
          <p className="font-medium">{uploading ? "Uploading" : "Drop files here to upload"}</p>
          <p className="text-sm text-muted-foreground">Remember to add alternative text and a credit for every photograph.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="upload-folder">
            Upload to folder
          </label>
          <Input
            id="upload-folder"
            list="media-folders"
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            className="h-10 sm:w-40"
            placeholder="Folder"
          />
          <datalist id="media-folders">
            {folders.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              void onFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload /> Choose files
          </Button>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, alt text or credit" className="h-10 pl-9" aria-label="Search media" />
        </div>
        <select value={folder} onChange={(e) => setFolder(e.target.value)} className="h-10 rounded-lg border border-input bg-white px-3 text-sm" aria-label="Filter by folder">
          <option value="">All folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as "" | "image" | "video")} className="h-10 rounded-lg border border-input bg-white px-3 text-sm" aria-label="Filter by type">
          <option value="">Images and videos</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Images />} title="No media found" description="Upload photographs or adjust the filters." />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => setSelected(item)} className="group block w-full text-left">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-border transition group-hover:ring-evergreen">
                  {item.mime_type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail from storage
                    <img src={item.url} alt={item.alt_text} loading="lazy" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <FileVideo className="size-8" />
                    </span>
                  )}
                  {!item.alt_text && item.mime_type.startsWith("image/") ? (
                    <span className="absolute top-2 left-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">No alt text</span>
                  ) : null}
                  {!item.storage_path ? (
                    <span className="absolute top-2 right-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Bundled</span>
                  ) : null}
                </div>
                <p className="mt-2 truncate text-xs font-medium">{item.file_name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{item.folder}</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <MediaDetails
        asset={selected}
        onClose={() => setSelected(null)}
        onSaved={(a) => {
          setItems((prev) => prev.map((i) => (i.id === a.id ? a : i)));
          setSelected(a);
        }}
        onDeleted={(id) => {
          setItems((prev) => prev.filter((i) => i.id !== id));
          setSelected(null);
        }}
      />
    </>
  );
}

function MediaDetails({
  asset,
  onClose,
  onSaved,
  onDeleted,
}: {
  asset: MediaAsset | null;
  onClose: () => void;
  onSaved: (a: MediaAsset) => void;
  onDeleted: (id: string) => void;
}) {
  const [form, setForm] = React.useState<MediaAsset | null>(asset);
  const [usage, setUsage] = React.useState<{ source: string; label: string }[] | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const { run, pending } = useAction();

  React.useEffect(() => {
    setForm(asset);
    setUsage(null);
    setConfirmDelete(false);
    if (asset) {
      void getMediaUsage(asset.url).then((r) => setUsage(r.ok ? (r.data ?? []) : []));
    }
  }, [asset]);

  if (!asset || !form) return null;
  const set = (k: keyof MediaAsset, v: string) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <Dialog
      open
      onOpenChange={(o) => !o && onClose()}
      title="Media details"
      description={asset.file_name}
      className="max-w-4xl"
      footer={
        <>
          {confirmDelete ? (
            <Button
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={async () => {
                const res = await run(deleteMedia(asset.id, (usage?.length ?? 0) > 0), { refresh: false });
                if (res.ok) onDeleted(asset.id);
              }}
            >
              <Trash2 /> {usage?.length ? "Delete anyway" : "Confirm delete"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="mr-auto text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            disabled={pending}
            onClick={async () => {
              const res = await run(
                updateMedia({ id: form.id, alt_text: form.alt_text, caption: form.caption, credit: form.credit, source_url: form.source_url, folder: form.folder }),
                { refresh: false },
              );
              if (res.ok && res.data) onSaved(res.data);
            }}
          >
            Save details
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl bg-muted">
            {asset.mime_type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview
              <img src={asset.url} alt={form.alt_text} className="max-h-80 w-full object-contain" />
            ) : (
              <video src={asset.url} controls className="max-h-80 w-full" />
            )}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{asset.mime_type}</dd>
            {asset.width && asset.height ? (
              <>
                <dt className="text-muted-foreground">Dimensions</dt>
                <dd>
                  {asset.width} × {asset.height}
                </dd>
              </>
            ) : null}
            {asset.size_bytes ? (
              <>
                <dt className="text-muted-foreground">Size</dt>
                <dd>{formatBytes(asset.size_bytes)}</dd>
              </>
            ) : null}
            <dt className="text-muted-foreground">Added</dt>
            <dd>{formatDate(asset.created_at)}</dd>
          </dl>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(asset.url.startsWith("/") ? `${window.location.origin}${asset.url}` : asset.url);
                toast.success("Link copied");
              }}
            >
              <Copy /> Copy link
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={asset.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Open
              </a>
            </Button>
          </div>
          <div className="mt-5 rounded-xl border border-border p-4 text-sm">
            <p className="font-medium">Where this is used</p>
            {usage === null ? (
              <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Checking
              </p>
            ) : usage.length === 0 ? (
              <p className="mt-1 text-muted-foreground">Not used anywhere. It is safe to delete.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {usage.map((u, i) => (
                  <li key={i} className="text-muted-foreground">
                    <span className="font-medium text-charcoal">{u.source}:</span> {u.label}
                  </li>
                ))}
              </ul>
            )}
            {confirmDelete && usage?.length ? (
              <p className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-800">
                This file is in use. Deleting it will leave broken images in the places listed above.
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="m-alt">Alternative text</Label>
            <Textarea id="m-alt" rows={2} value={form.alt_text} onChange={(e) => set("alt_text", e.target.value)} />
            <FieldHelp>Describe what the image shows for people using screen readers.</FieldHelp>
          </div>
          <div>
            <Label htmlFor="m-caption">Caption</Label>
            <Input id="m-caption" value={form.caption} onChange={(e) => set("caption", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="m-credit">Credit</Label>
            <Input id="m-credit" value={form.credit} onChange={(e) => set("credit", e.target.value)} placeholder="Photographer, licence" />
            <FieldHelp>Credited images are listed on the public Image credits page.</FieldHelp>
          </div>
          <div>
            <Label htmlFor="m-source">Source / licence link</Label>
            <Input id="m-source" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label htmlFor="m-folder">Folder</Label>
            <Input id="m-folder" value={form.folder} onChange={(e) => set("folder", e.target.value)} />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
