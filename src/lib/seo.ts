import type { Metadata } from "next";
import type { ImageRef, SiteSettings } from "@/lib/types";
import { SITE_URL } from "@/lib/env";

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function pageMetadata({
  settings,
  title,
  description,
  image,
  path,
  type = "website",
  publishedTime,
}: {
  settings: SiteSettings;
  title?: string;
  description?: string;
  image?: ImageRef | null;
  path: string;
  type?: "website" | "article";
  publishedTime?: string | null;
}): Metadata {
  const desc = description || settings.seo_description;
  const og = image?.src ? image : settings.og_image;
  const images = og?.src ? [{ url: absoluteUrl(og.src), alt: og.alt }] : undefined;
  return {
    title: title || undefined,
    description: desc,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type,
      url: absoluteUrl(path),
      siteName: settings.org_name,
      title: title || settings.seo_title,
      description: desc,
      images,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: title || settings.seo_title,
      description: desc,
      images: images?.map((i) => i.url),
    },
  };
}
