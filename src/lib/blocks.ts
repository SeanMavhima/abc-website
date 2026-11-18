/**
 * Block registry.
 *
 * Every section of the homepage and of every CMS page is a "block". This file
 * describes each block type as a list of fields. The admin section editor
 * renders forms from these field specs, so administrators never edit HTML or
 * JSON, and the public renderer reads the same keys.
 *
 * Keep this file free of React / Node imports (shared by client and server).
 */
import type { Block, BlockType } from "./types.ts";

export type FieldOption = { value: string; label: string };

export type Field =
  | { kind: "text"; name: string; label: string; help?: string; placeholder?: string }
  | { kind: "textarea"; name: string; label: string; help?: string; rows?: number }
  | { kind: "richtext"; name: string; label: string; help?: string }
  | { kind: "image"; name: string; label: string; help?: string }
  | { kind: "link"; name: string; label: string; help?: string }
  | { kind: "number"; name: string; label: string; help?: string; min?: number; max?: number; step?: number }
  | { kind: "boolean"; name: string; label: string; help?: string }
  | { kind: "date"; name: string; label: string; help?: string }
  | { kind: "select"; name: string; label: string; help?: string; options: FieldOption[] }
  | { kind: "icon"; name: string; label: string; help?: string }
  | {
      kind: "list";
      name: string;
      label: string;
      help?: string;
      itemLabel: string;
      titleField?: string;
      fields: Field[];
      newItem: Record<string, unknown>;
    };

export type BlockDefinition = {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  fields: Field[];
  defaults: Record<string, unknown>;
};

const eyebrow: Field = { kind: "text", name: "eyebrow", label: "Eyebrow (small label above heading)" };
const heading: Field = { kind: "text", name: "heading", label: "Heading" };
const intro: Field = { kind: "textarea", name: "intro", label: "Introduction", rows: 3 };
const background: Field = {
  kind: "select",
  name: "background",
  label: "Background",
  options: [
    { value: "ivory", label: "Warm ivory" },
    { value: "white", label: "White" },
    { value: "sage", label: "Soft sage" },
    { value: "forest", label: "Deep forest (dark)" },
  ],
};

export const BLOCKS: Record<BlockType, BlockDefinition> = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Full-screen opening: an interactive 3D landscape, with a photographic slideshow as the fallback.",
    icon: "camera",
    fields: [
      eyebrow,
      { kind: "text", name: "headline", label: "Headline" },
      { kind: "textarea", name: "text", label: "Supporting text", rows: 3 },
      { kind: "link", name: "primary", label: "Primary button" },
      { kind: "link", name: "secondary", label: "Secondary button" },
      {
        kind: "select",
        name: "experience",
        label: "Opening experience",
        help: "The 3D landscape is shown where the visitor's device supports it. Visitors who prefer reduced motion, use a low-power device or switch off 3D see the photographs below instead.",
        options: [
          { value: "3d", label: "Interactive 3D landscape" },
          { value: "photo", label: "Photographs only (3D off)" },
        ],
      },
      {
        kind: "select",
        name: "theme",
        label: "3D visual theme",
        options: [
          { value: "auto", label: "Follow the visitor's time of day" },
          { value: "dawn", label: "Dawn: gold light and mist" },
          { value: "day", label: "Day: clear and green" },
          { value: "dusk", label: "Dusk: deep blue with fireflies" },
        ],
      },
      {
        kind: "boolean",
        name: "sound",
        label: "Offer ambient sound",
        help: "Adds a sound button to the 3D landscape. Sound never plays until a visitor switches it on.",
      },
      {
        kind: "list",
        name: "chapters",
        label: "3D chapters",
        itemLabel: "Chapter",
        titleField: "title",
        help: "Short messages shown one after another as visitors scroll through the landscape. Three works best.",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "text", label: "Text", rows: 2 },
        ],
        newItem: { title: "New chapter", text: "" },
      },
      {
        kind: "list",
        name: "hotspots",
        label: "3D information points",
        itemLabel: "Information point",
        titleField: "title",
        help: "Markers placed in the landscape. Selecting one opens a small panel.",
        fields: [
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "text", label: "Text", rows: 3 },
          {
            kind: "select",
            name: "zone",
            label: "Where it sits in the landscape",
            options: [
              { value: "canopy", label: "Forest canopy" },
              { value: "hills", label: "Hills" },
              { value: "wetland", label: "Wetland" },
              { value: "water", label: "Open water" },
              { value: "sky", label: "Sky" },
            ],
          },
          { kind: "link", name: "link", label: "Link (optional)" },
        ],
        newItem: { title: "New point", text: "", zone: "hills", link: { label: "", href: "" } },
      },
      {
        kind: "select",
        name: "mode",
        label: "Photograph display mode",
        options: [
          { value: "slideshow", label: "Animated slideshow" },
          { value: "static", label: "Static image (first visible slide)" },
        ],
      },
      {
        kind: "number",
        name: "interval",
        label: "Seconds per slide",
        min: 4,
        max: 20,
        step: 1,
        help: "How long each photograph stays on screen (4 to 20 seconds).",
      },
      {
        kind: "list",
        name: "slides",
        label: "Photographs",
        itemLabel: "Slide",
        help: "Shown when the 3D landscape is off or unavailable. Use the arrows to reorder. Hidden slides are kept but not shown.",
        fields: [
          { kind: "image", name: "image", label: "Photograph" },
          { kind: "boolean", name: "visible", label: "Show this slide" },
        ],
        newItem: { image: null, visible: true },
      },
    ],
    defaults: {
      eyebrow: "",
      headline: "New headline",
      text: "",
      primary: { label: "", href: "" },
      secondary: { label: "", href: "" },
      experience: "3d",
      theme: "auto",
      sound: true,
      chapters: [],
      hotspots: [],
      mode: "slideshow",
      interval: 8,
      slides: [],
    },
  },
  image_text: {
    type: "image_text",
    label: "Image and text",
    description: "Two-column section with a photograph beside text.",
    icon: "book-open",
    fields: [
      eyebrow,
      heading,
      { kind: "richtext", name: "body", label: "Body text" },
      { kind: "image", name: "image", label: "Photograph" },
      {
        kind: "select",
        name: "image_position",
        label: "Photograph position",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      {
        kind: "select",
        name: "variant",
        label: "Style",
        options: [
          { value: "light", label: "Light" },
          { value: "sage", label: "Soft sage" },
          { value: "feature", label: "Full-width photographic feature (dark)" },
        ],
      },
      {
        kind: "text",
        name: "badge",
        label: "Status badge (optional)",
        help: "For example: Proposed six-month pilot",
      },
      { kind: "link", name: "link", label: "Button (optional)" },
    ],
    defaults: {
      eyebrow: "",
      heading: "Section heading",
      body: "<p></p>",
      image: null,
      image_position: "right",
      variant: "light",
      badge: "",
      link: { label: "", href: "" },
    },
  },
  cards: {
    type: "cards",
    label: "Cards",
    description: "A grid of cards with icons, numbers or photographs.",
    icon: "sparkles",
    fields: [
      eyebrow,
      heading,
      intro,
      {
        kind: "select",
        name: "layout",
        label: "Card style",
        options: [
          { value: "icon", label: "Icon cards" },
          { value: "numbered", label: "Numbered cards" },
          { value: "image", label: "Photograph cards" },
          { value: "minimal", label: "Minimal text" },
        ],
      },
      {
        kind: "select",
        name: "columns",
        label: "Columns on large screens",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
        ],
      },
      background,
      {
        kind: "list",
        name: "items",
        label: "Cards",
        itemLabel: "Card",
        titleField: "title",
        fields: [
          { kind: "icon", name: "icon", label: "Icon" },
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "text", label: "Description", rows: 3 },
          { kind: "image", name: "image", label: "Photograph (photograph cards only)" },
          { kind: "link", name: "link", label: "Link (optional)" },
        ],
        newItem: { icon: "leaf", title: "New card", text: "", image: null, link: { label: "", href: "" } },
      },
    ],
    defaults: { eyebrow: "", heading: "Section heading", intro: "", layout: "icon", columns: "3", background: "ivory", items: [] },
  },
  steps: {
    type: "steps",
    label: "Process / pathway",
    description: "A sequence of steps, shown as a timeline or as an interactive pathway that visitors can explore.",
    icon: "footprints",
    fields: [
      eyebrow,
      heading,
      intro,
      background,
      {
        kind: "select",
        name: "style",
        label: "Style",
        options: [
          { value: "timeline", label: "Timeline" },
          { value: "pathway", label: "Interactive pathway (a cycle visitors can explore)" },
        ],
      },
      {
        kind: "list",
        name: "items",
        label: "Steps",
        itemLabel: "Step",
        titleField: "title",
        fields: [
          { kind: "icon", name: "icon", label: "Icon" },
          { kind: "text", name: "title", label: "Title" },
          { kind: "textarea", name: "text", label: "Description", rows: 2 },
          { kind: "textarea", name: "activities", label: "Activities (interactive pathway only)", rows: 3, help: "One per line." },
          { kind: "text", name: "leads_to", label: "How it leads to the next step (interactive pathway only)" },
        ],
        newItem: { icon: "leaf", title: "New step", text: "", activities: "", leads_to: "" },
      },
    ],
    defaults: { eyebrow: "", heading: "Section heading", intro: "", background: "white", style: "timeline", items: [] },
  },
  rich_text: {
    type: "rich_text",
    label: "Text",
    description: "Formatted text with headings, lists and links.",
    icon: "notebook-pen",
    fields: [
      eyebrow,
      heading,
      { kind: "richtext", name: "body", label: "Body text" },
      {
        kind: "select",
        name: "width",
        label: "Width",
        options: [
          { value: "narrow", label: "Narrow (best for reading)" },
          { value: "wide", label: "Wide (two columns on large screens)" },
        ],
      },
      background,
    ],
    defaults: { eyebrow: "", heading: "", body: "<p></p>", width: "narrow", background: "ivory" },
  },
  statement: {
    type: "statement",
    label: "Statement",
    description: "A large, editorial statement such as a purpose or vision.",
    icon: "feather",
    fields: [
      eyebrow,
      { kind: "textarea", name: "text", label: "Statement", rows: 4 },
      { kind: "text", name: "attribution", label: "Attribution (optional)" },
      background,
    ],
    defaults: { eyebrow: "", text: "", attribution: "", background: "forest" },
  },
  cta: {
    type: "cta",
    label: "Call to action",
    description: "A photographic banner inviting visitors to act.",
    icon: "megaphone",
    fields: [
      eyebrow,
      heading,
      { kind: "textarea", name: "text", label: "Text", rows: 3 },
      { kind: "link", name: "primary", label: "Primary button" },
      { kind: "link", name: "secondary", label: "Secondary button (optional)" },
      { kind: "image", name: "image", label: "Background photograph (optional)" },
    ],
    defaults: {
      eyebrow: "",
      heading: "Call to action",
      text: "",
      primary: { label: "", href: "" },
      secondary: { label: "", href: "" },
      image: null,
    },
  },
  statistics: {
    type: "statistics",
    label: "Impact statistics",
    description: "Figures from the Impact statistics manager, each labelled with its status and date.",
    icon: "target",
    fields: [
      eyebrow,
      heading,
      intro,
      {
        kind: "text",
        name: "note",
        label: "Disclosure note",
        help: "Make clear whether figures are targets or verified results.",
      },
      {
        kind: "select",
        name: "status_filter",
        label: "Which statistics to show",
        options: [
          { value: "all", label: "All visible statistics" },
          { value: "target", label: "Targets only" },
          { value: "ongoing", label: "Ongoing only" },
          { value: "achieved", label: "Achieved results only" },
          { value: "verified", label: "Verified results only" },
        ],
      },
      { kind: "boolean", name: "show_legend", label: "Explain what each status means" },
    ],
    defaults: { eyebrow: "", heading: "Impact", intro: "", note: "", status_filter: "all", show_legend: true },
  },
  programmes: {
    type: "programmes",
    label: "Programmes",
    description: "Programme cards from the Programme manager.",
    icon: "compass",
    fields: [
      eyebrow,
      heading,
      intro,
      { kind: "boolean", name: "featured_only", label: "Only show featured programmes" },
      { kind: "link", name: "link", label: "Link below cards (optional)" },
    ],
    defaults: { eyebrow: "", heading: "Programmes", intro: "", featured_only: false, link: { label: "", href: "" } },
  },
  stories: {
    type: "stories",
    label: "Stories",
    description: "Latest or featured published stories.",
    icon: "newspaper",
    fields: [
      eyebrow,
      heading,
      intro,
      { kind: "number", name: "count", label: "Number of stories", min: 1, max: 9, step: 1 },
      { kind: "boolean", name: "featured_only", label: "Only show featured stories" },
      {
        kind: "text",
        name: "category",
        label: "Only this category (optional)",
        help: "The category's web address, for example research-updates. Leave empty for all categories.",
      },
      { kind: "link", name: "link", label: "Link (optional)" },
    ],
    defaults: { eyebrow: "", heading: "Stories", intro: "", count: 3, featured_only: false, category: "", link: { label: "", href: "" } },
  },
  partners: {
    type: "partners",
    label: "Organisations",
    description: "Organisations from the Partners manager, filtered by relationship.",
    icon: "handshake",
    fields: [
      eyebrow,
      heading,
      intro,
      {
        kind: "select",
        name: "relationship",
        label: "Relationship to display",
        help: "Only use 'Confirmed partners' once a partnership is established and branding permission is granted.",
        options: [
          { value: "prospective", label: "Prospective collaborators" },
          { value: "confirmed", label: "Confirmed partners" },
          { value: "supporting", label: "Supporting organisations" },
        ],
      },
      { kind: "text", name: "note", label: "Disclosure note (optional)" },
      {
        kind: "textarea",
        name: "empty_text",
        label: "Message when there are no organisations to show",
        rows: 3,
        help: "Leave empty to hide the whole section until there is something to show.",
      },
      { kind: "link", name: "link", label: "Button (optional)" },
    ],
    defaults: { eyebrow: "", heading: "Organisations", intro: "", relationship: "confirmed", note: "", empty_text: "", link: { label: "", href: "" } },
  },
  team: {
    type: "team",
    label: "Team",
    description: "Visible team members from the Team manager. Hidden automatically when empty.",
    icon: "users",
    fields: [eyebrow, heading, intro],
    defaults: { eyebrow: "", heading: "Our team", intro: "" },
  },
  form: {
    type: "form",
    label: "Form",
    description: "A working contact form or involvement application form.",
    icon: "messages",
    fields: [
      eyebrow,
      heading,
      intro,
      {
        kind: "select",
        name: "form",
        label: "Form type",
        options: [
          { value: "contact", label: "Contact enquiry" },
          { value: "volunteer", label: "Involvement application" },
        ],
      },
      { kind: "image", name: "image", label: "Side photograph (optional)" },
    ],
    defaults: { eyebrow: "", heading: "Get in touch", intro: "", form: "contact", image: null },
  },
  contact_details: {
    type: "contact_details",
    label: "Contact details",
    description: "Email, phone, location and social links from Website settings. Empty values are hidden.",
    icon: "map-pin",
    fields: [eyebrow, heading, intro, { kind: "boolean", name: "show_social", label: "Show social media links" }],
    defaults: { eyebrow: "", heading: "Contact details", intro: "", show_social: true },
  },
  faq: {
    type: "faq",
    label: "Questions and answers",
    description: "Expandable questions and answers.",
    icon: "lightbulb",
    fields: [
      eyebrow,
      heading,
      {
        kind: "list",
        name: "items",
        label: "Questions",
        itemLabel: "Question",
        titleField: "question",
        fields: [
          { kind: "text", name: "question", label: "Question" },
          { kind: "textarea", name: "answer", label: "Answer", rows: 4 },
        ],
        newItem: { question: "New question", answer: "" },
      },
    ],
    defaults: { eyebrow: "", heading: "Questions", items: [] },
  },
  gallery: {
    type: "gallery",
    label: "Photo gallery",
    description: "A grid of photographs.",
    icon: "camera",
    fields: [
      eyebrow,
      heading,
      intro,
      {
        kind: "list",
        name: "images",
        label: "Photographs",
        itemLabel: "Photograph",
        fields: [{ kind: "image", name: "image", label: "Photograph" }],
        newItem: { image: null },
      },
    ],
    defaults: { eyebrow: "", heading: "Gallery", intro: "", images: [] },
  },
  atlas: {
    type: "atlas",
    label: "Living atlas",
    description: "Interactive cross-section of habitats from the Atlas manager, with the species that live in each.",
    icon: "mountain",
    fields: [
      eyebrow,
      heading,
      intro,
      { kind: "text", name: "note", label: "Disclosure note", help: "Make clear that entries are reference information unless they are ABC observations." },
      { kind: "link", name: "link", label: "Button (optional)" },
    ],
    defaults: { eyebrow: "", heading: "The living atlas", intro: "", note: "", link: { label: "", href: "" } },
  },
  species: {
    type: "species",
    label: "Species explorer",
    description: "Species entries from the Species manager, with search and filters.",
    icon: "bird",
    fields: [
      eyebrow,
      heading,
      intro,
      {
        kind: "select",
        name: "mode",
        label: "What to show",
        options: [
          { value: "all", label: "All published species, with search and filters" },
          { value: "featured", label: "Featured species only (no filters)" },
        ],
      },
      { kind: "number", name: "count", label: "Maximum to show (featured only)", min: 1, max: 24, step: 1 },
      { kind: "link", name: "link", label: "Link (optional)" },
    ],
    defaults: { eyebrow: "", heading: "Species", intro: "", mode: "all", count: 6, link: { label: "", href: "" } },
  },
  nature_labs: {
    type: "nature_labs",
    label: "Nature Lab sites",
    description: "Published Nature Labs from the Nature Labs manager.",
    icon: "map-pin",
    fields: [
      eyebrow,
      heading,
      intro,
      { kind: "textarea", name: "empty_text", label: "Message when no Nature Labs are published", rows: 3 },
    ],
    defaults: { eyebrow: "", heading: "Nature Labs", intro: "", empty_text: "" },
  },
  projects: {
    type: "projects",
    label: "Projects",
    description: "Citizen science or research projects, each labelled with its status.",
    icon: "microscope",
    fields: [
      eyebrow,
      heading,
      intro,
      {
        kind: "select",
        name: "kind",
        label: "Which projects",
        options: [
          { value: "citizen_science", label: "Citizen science projects" },
          { value: "research", label: "Research projects" },
        ],
      },
      { kind: "textarea", name: "empty_text", label: "Message when there are no projects", rows: 3 },
    ],
    defaults: { eyebrow: "", heading: "Projects", intro: "", kind: "citizen_science", empty_text: "" },
  },
  milestones: {
    type: "milestones",
    label: "Milestones",
    description: "A timeline from the Milestones manager, each stage labelled planned, in progress or done.",
    icon: "calendar",
    fields: [eyebrow, heading, intro, { kind: "text", name: "note", label: "Disclosure note (optional)" }],
    defaults: { eyebrow: "", heading: "Milestones", intro: "", note: "" },
  },
  observations: {
    type: "observations",
    label: "Community observations",
    description: "Approved community observations and the submission form. The form is opened and closed in Website settings.",
    icon: "eye",
    fields: [
      eyebrow,
      heading,
      intro,
      { kind: "textarea", name: "closed_text", label: "Message while submissions are closed", rows: 3 },
    ],
    defaults: { eyebrow: "", heading: "Community observations", intro: "", closed_text: "Observation submissions are not open yet." },
  },
};

export const BLOCK_TYPES = Object.keys(BLOCKS) as BlockType[];

export function createBlock(type: BlockType, id: string): Block {
  return { id, type, visible: true, data: structuredClone({ anchor: "", ...BLOCKS[type].defaults }) };
}
