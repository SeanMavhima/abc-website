import Image, { type ImageProps } from "next/image";
import type { ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Hosts that next/image is configured to optimise (see next.config.ts). */
function isOptimisable(src: string) {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "";
    return host.endsWith(".supabase.co") || host === supabaseHost;
  } catch {
    return false;
  }
}

type SmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  image: ImageRef | null | undefined;
  fallbackAlt?: string;
};

/**
 * Renders a CMS image reference with next/image. Images from unknown hosts
 * are served unoptimised rather than failing. SVGs are never optimised.
 */
export function SmartImage({ image, fallbackAlt = "", className, ...props }: SmartImageProps) {
  if (!image?.src) return null;
  const unoptimized = !isOptimisable(image.src) || image.src.toLowerCase().endsWith(".svg");
  return (
    <Image
      src={image.src}
      alt={image.alt || fallbackAlt}
      className={cn("object-cover", className)}
      unoptimized={unoptimized}
      {...props}
    />
  );
}

/** Neutral photographic placeholder for cards without an image. */
export function ImagePlaceholder({ className, label }: { className?: string; label?: string }) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center bg-gradient-to-br from-evergreen to-forest text-white/40",
        className,
      )}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg viewBox="0 0 48 48" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M24 42c0-10 4-18 14-24-10 0-18 6-20 14" strokeLinecap="round" />
        <path d="M24 42C24 30 18 20 8 16c2 10 8 18 16 18" strokeLinecap="round" />
      </svg>
    </div>
  );
}
