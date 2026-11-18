/**
 * Environment helpers.
 *
 * "Development preview mode" is active whenever the Supabase URL or anon key
 * is missing. In that mode the public site renders the bundled seed content
 * (with a visible banner saying so) and the CMS is unavailable. Nothing
 * pretends to be connected to a live backend.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_URL.includes("your-project-ref");

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const MEDIA_BUCKET = "media";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB (Supabase free-tier per-file limit)
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
