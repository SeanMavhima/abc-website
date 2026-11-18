import { getNavigation, getSiteSettings } from "@/lib/data/public";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { DevPreviewBanner } from "@/components/site/dev-banner";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, header, footer] = await Promise.all([getSiteSettings(), getNavigation("header"), getNavigation("footer")]);
  return (
    <>
      <SiteHeader settings={settings} items={header} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter settings={settings} columns={footer} />
      <DevPreviewBanner />
    </>
  );
}
