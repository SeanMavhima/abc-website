"use client";

import * as React from "react";
import { toast } from "sonner";
import { getBrowserClient } from "@/lib/supabase/browser";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  MEDIA_BUCKET,
} from "@/lib/env";
import { createMedia } from "@/lib/actions/admin/media";
import type { MediaAsset } from "@/lib/types";
import { formatBytes, slugify } from "@/lib/utils";

export function validateFile(file: File, accept: "image" | "video" | "any" = "any"): string | null {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  if (accept === "image" && !isImage) return `${file.name}: please choose a JPEG, PNG, WebP, AVIF, GIF or SVG image.`;
  if (accept === "video" && !isVideo) return `${file.name}: please choose an MP4 or WebM video.`;
  if (!isImage && !isVideo) return `${file.name}: this file type is not supported.`;
  const max = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > max) return `${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(max)}.`;
  return null;
}

function imageDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return Promise.resolve({ width: null, height: null });
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function useMediaUpload() {
  const [uploading, setUploading] = React.useState(0);

  const upload = React.useCallback(
    async (files: File[], opts: { folder?: string; accept?: "image" | "video" | "any" } = {}): Promise<MediaAsset[]> => {
      const done: MediaAsset[] = [];
      const supabase = getBrowserClient();
      for (const file of files) {
        const problem = validateFile(file, opts.accept);
        if (problem) {
          toast.error(problem);
          continue;
        }
        setUploading((n) => n + 1);
        try {
          const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
          const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
          const now = new Date();
          const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
          const { error } = await supabase.storage
            .from(MEDIA_BUCKET)
            .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
          if (error) throw new Error(error.message);
          const { data: pub } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
          const dims = await imageDimensions(file);
          const res = await createMedia({
            url: pub.publicUrl,
            storage_path: path,
            file_name: file.name.slice(0, 300),
            mime_type: file.type,
            size_bytes: file.size,
            width: dims.width,
            height: dims.height,
            alt_text: "",
            credit: "",
            folder: opts.folder || "General",
          });
          if (!res.ok) {
            await supabase.storage.from(MEDIA_BUCKET).remove([path]);
            throw new Error(res.error);
          }
          if (res.data) done.push(res.data);
        } catch (e) {
          toast.error(`Upload failed for ${file.name}: ${e instanceof Error ? e.message : "unknown error"}`);
        } finally {
          setUploading((n) => n - 1);
        }
      }
      if (done.length) toast.success(done.length === 1 ? "File uploaded" : `${done.length} files uploaded`);
      return done;
    },
    [],
  );

  return { upload, uploading: uploading > 0 };
}
