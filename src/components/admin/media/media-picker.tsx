"use client";

import * as React from "react";
import { FileVideo, ImageIcon, Loader2, Search, Upload } from "lucide-react";
import { listMedia } from "@/lib/actions/admin/media";
import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/form-controls";
import { useMediaUpload } from "./use-media-upload";

/**
 * Dialog for choosing an existing file from the media library or uploading a
 * new one. Calls onSelect with the chosen asset.
 */
export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  kind = "image",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: MediaAsset) => void;
  kind?: "image" | "video";
}) {
  const [items, setItems] = React.useState<MediaAsset[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [folder, setFolder] = React.useState("");
  const { upload, uploading } = useMediaUpload();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setError(null);
    const res = await listMedia({ kind });
    if (res.ok) setItems(res.data ?? []);
    else setError(res.error);
  }, [kind]);

  React.useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const folders = React.useMemo(() => Array.from(new Set((items ?? []).map((i) => i.folder))).sort(), [items]);
  const filtered = (items ?? []).filter((i) => {
    if (folder && i.folder !== folder) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return `${i.file_name} ${i.alt_text} ${i.caption}`.toLowerCase().includes(s);
  });

  /** Choosing a file applies it straight away and closes the picker. */
  function choose(asset: MediaAsset) {
    onSelect(asset);
    onOpenChange(false);
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const uploaded = await upload(Array.from(files), { accept: kind, folder: folder || "General" });
    if (uploaded.length) {
      setItems((prev) => [...uploaded, ...(prev ?? [])]);
      // Use the newly uploaded file straight away.
      choose(uploaded[0]);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={kind === "video" ? "Choose a video" : "Choose an image"}
      description="Click a file to use it, or upload a new one."
      className="max-w-5xl"
      footer={
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search files" className="h-10 pl-9" aria-label="Search files" />
        </div>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="h-10 rounded-lg border border-input bg-white px-3 text-sm"
          aria-label="Filter by folder"
        >
          <option value="">All folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          multiple
          accept={kind === "video" ? "video/mp4,video/webm" : "image/*"}
          onChange={(e) => {
            void onFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" size="sm" className="h-10" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload
        </Button>
      </div>

      <div
        className="mt-4 min-h-64"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void onFiles(e.dataTransfer.files);
        }}
      >
        {error ? (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>
        ) : items === null ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground">
            <ImageIcon className="size-6" />
            No files found. Upload one, or drop files here.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => choose(item)}
                  aria-label={`Use ${item.alt_text || item.file_name}`}
                  title={item.file_name}
                  className={cn(
                    "group relative block aspect-square w-full overflow-hidden rounded-xl bg-muted ring-2 ring-transparent transition",
                    "hover:ring-evergreen focus-visible:ring-evergreen focus-visible:outline-none",
                  )}
                >
                  {item.mime_type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails from arbitrary storage URLs
                    <img src={item.url} alt={item.alt_text} loading="lazy" className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <FileVideo className="size-8" />
                      <span className="px-2 text-xs break-all">{item.file_name}</span>
                    </span>
                  )}
                  {!item.alt_text && item.mime_type.startsWith("image/") ? (
                    <span className="absolute bottom-2 left-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                      No alt text
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
