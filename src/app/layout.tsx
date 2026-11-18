import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { getSiteSettings } from "@/lib/data/public";
import { SITE_URL } from "@/lib/env";
import { MotionProvider } from "@/components/site/motion-provider";
import "./globals.css";

// Display: a soft variable serif with an editorial, botanical character.
const heading = Fraunces({ subsets: ["latin"], variable: "--font-heading", display: "swap", axes: ["opsz", "SOFT"] });
// Labels: a monospace face for specimen-label details (statuses, scientific names, elevations).
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-label", display: "swap", weight: ["400", "500"] });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

const HEX = /^#[0-9a-f]{3,8}$/i;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: s.seo_title || s.org_name, template: `%s | ${s.short_name || s.org_name}` },
    description: s.seo_description,
    applicationName: s.org_name,
    icons: s.favicon_url ? { icon: s.favicon_url } : undefined,
    openGraph: {
      siteName: s.org_name,
      type: "website",
      images: s.og_image?.src ? [{ url: s.og_image.src, alt: s.og_image.alt }] : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#173D32",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const c = settings.brand_colors;
  // Brand colours from Website settings (validated as hex before use).
  const style = {
    ...(HEX.test(c.forest) && { "--brand-forest": c.forest }),
    ...(HEX.test(c.evergreen) && { "--brand-evergreen": c.evergreen }),
    ...(HEX.test(c.sage) && { "--brand-sage": c.sage }),
    ...(HEX.test(c.ivory) && { "--brand-ivory": c.ivory }),
    ...(HEX.test(c.earth) && { "--brand-earth": c.earth }),
    ...(HEX.test(c.charcoal) && { "--brand-charcoal": c.charcoal }),
  } as React.CSSProperties;

  return (
    <html lang="en-GB" className={`${heading.variable} ${body.variable} ${mono.variable}`} style={style} suppressHydrationWarning>
      <body className="min-h-screen">
        <MotionProvider>{children}</MotionProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
