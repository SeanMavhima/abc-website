import type { Block, ImageRef, LinkRef, SiteSettings } from "@/lib/types";
import { arr, num, str } from "@/lib/utils";
import { HeroExperience, type Chapter, type Hotspot } from "@/components/experience/hero-experience";
import { isThemeSetting, type Zone } from "@/components/experience/world";
import { ImageTextBlock } from "./image-text-block";
import { CardsBlock } from "./cards-block";
import { StepsTimeline } from "./steps-timeline";
import { CtaBlock, ContactDetailsBlock, FaqBlock, FormBlock, GalleryBlock, RichTextBlock, StatementBlock } from "./simple-blocks";
import { PartnersBlock, ProgrammesBlock, StatisticsBlock, StoriesBlock, TeamBlock } from "./data-blocks";
import { AtlasBlock, MilestonesBlock, NatureLabsBlock, ObservationsBlock, ProjectsBlock, SpeciesBlock } from "./nature-blocks";
import { PathwayExplorer, type PathwayStep } from "./pathway-explorer";
import { SectionHeading, SectionShell, isDark } from "./shared";

const ZONES: Zone[] = ["canopy", "hills", "wetland", "water", "sky"];

function HeroBlock({ data }: { data: Record<string, unknown> }) {
  const slides = arr<{ image?: ImageRef | null; visible?: boolean }>(data.slides)
    .filter((s) => s.visible !== false && s.image?.src)
    .map((s) => ({ image: s.image as ImageRef }));
  const chapters: Chapter[] = arr<Partial<Chapter>>(data.chapters)
    .map((c) => ({ title: str(c.title), text: str(c.text) }))
    .slice(0, 5);
  const hotspots: Hotspot[] = arr<Partial<Hotspot>>(data.hotspots)
    .map((h) => ({
      title: str(h.title),
      text: str(h.text),
      zone: ZONES.includes(h.zone as Zone) ? (h.zone as Zone) : "hills",
      link: (h.link as LinkRef) ?? { label: "", href: "" },
    }))
    .slice(0, 8);
  // A hero without photographs still renders its text on the brand background.
  return (
    <HeroExperience
      data={{
        eyebrow: str(data.eyebrow),
        headline: str(data.headline),
        text: str(data.text),
        primary: (data.primary as LinkRef) ?? { label: "", href: "" },
        secondary: (data.secondary as LinkRef) ?? { label: "", href: "" },
        mode: str(data.mode) === "static" ? "static" : "slideshow",
        interval: num(data.interval, 8),
        slides,
        // Homepages saved before the 3D landscape existed have no setting: they get it by default.
        experience: str(data.experience, "3d") === "photo" ? "photo" : "3d",
        theme: isThemeSetting(data.theme) ? data.theme : "auto",
        sound: data.sound !== false,
        chapters,
        hotspots,
      }}
    />
  );
}

function StepsBlock({ data }: { data: Record<string, unknown> }) {
  const items = arr<PathwayStep>(data.items);
  if (items.length === 0) return null;
  const dark = isDark(data.background);
  if (str(data.style) === "pathway" && items.length >= 3) {
    return (
      <SectionShell id={str(data.anchor)} background={data.background} className="overflow-hidden">
        <div className="container-site">
          <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} dark={dark} />
          <PathwayExplorer items={items} dark={dark} />
        </div>
      </SectionShell>
    );
  }
  return (
    <SectionShell id={str(data.anchor)} background={data.background} className="overflow-hidden">
      <div className="container-site">
        <SectionHeading eyebrow={str(data.eyebrow)} heading={str(data.heading)} intro={str(data.intro)} dark={dark} align="center" />
        <StepsTimeline items={items} dark={dark} />
      </div>
    </SectionShell>
  );
}

export function BlockView({ block, settings }: { block: Block; settings: SiteSettings }) {
  const data = block.data ?? {};
  switch (block.type) {
    case "hero":
      return <HeroBlock data={data} />;
    case "image_text":
      return <ImageTextBlock data={data} />;
    case "cards":
      return <CardsBlock data={data} />;
    case "steps":
      return <StepsBlock data={data} />;
    case "rich_text":
      return <RichTextBlock data={data} />;
    case "statement":
      return <StatementBlock data={data} />;
    case "cta":
      return <CtaBlock data={data} />;
    case "statistics":
      return <StatisticsBlock data={data} />;
    case "programmes":
      return <ProgrammesBlock data={data} />;
    case "stories":
      return <StoriesBlock data={data} />;
    case "partners":
      return <PartnersBlock data={data} />;
    case "team":
      return <TeamBlock data={data} />;
    case "form":
      return <FormBlock data={data} />;
    case "contact_details":
      return <ContactDetailsBlock data={data} settings={settings} />;
    case "faq":
      return <FaqBlock data={data} />;
    case "gallery":
      return <GalleryBlock data={data} />;
    case "atlas":
      return <AtlasBlock data={data} />;
    case "species":
      return <SpeciesBlock data={data} />;
    case "nature_labs":
      return <NatureLabsBlock data={data} />;
    case "projects":
      return <ProjectsBlock data={data} />;
    case "milestones":
      return <MilestonesBlock data={data} />;
    case "observations":
      return <ObservationsBlock data={data} settings={settings} />;
    default:
      return null;
  }
}

export function BlockRenderer({ blocks, settings }: { blocks: Block[]; settings: SiteSettings }) {
  return (
    <>
      {blocks
        .filter((b) => b.visible !== false)
        .map((block) => (
          <BlockView key={block.id} block={block} settings={settings} />
        ))}
    </>
  );
}
