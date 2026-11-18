import { z } from "zod";
import { BLOCKS, BLOCK_TYPES, type Field } from "@/lib/blocks";
import { sanitizeRichText } from "@/lib/sanitize";
import { RESERVED_SLUGS } from "@/lib/reserved-slugs";
import type { Block, BlockType } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

/** Allows relative paths, in-page anchors, http(s), mailto and tel. Blocks javascript: etc. */
export function safeHref(value: unknown): string {
  if (typeof value !== "string") return "";
  const v = value.trim().slice(0, 500);
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (v.startsWith("#")) return v;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  return "";
}

const text = (max = 500) => z.string().trim().max(max).default("");
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");
const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must start with https://")
  .default("");

const imageObject = z.object({
  src: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\//i.test(v), "Image must be a site path or https URL"),
  alt: z.string().trim().max(300).default(""),
  credit: z.string().trim().max(300).optional(),
});

export const imageRefSchema = imageObject.nullable().default(null);

// z.string().url() alone would accept "javascript:..." URLs, so require http(s).
const socialLinks = z
  .array(
    z.object({
      platform: z.string().trim().min(1, "Each social link needs a platform name").max(40),
      url: z
        .string()
        .trim()
        .max(500)
        .regex(/^https?:\/\/[^\s]+$/i, "Social links must start with https://"),
    }),
  )
  .max(20)
  .default([]);

const sortOrder = z.coerce.number().int().min(0).max(100000).default(0);
const id = z.string().uuid().optional();
const richText = z.string().max(100000).default("").transform(sanitizeRichText);
/** Optional link to another record: an empty choice is stored as null. */
const uuidOrNull = z.preprocess((v) => (v === "" || v === undefined ? null : v), z.string().uuid().nullable());
/** Optional calendar date (YYYY-MM-DD): empty is stored as null. */
const dateOrNull = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
    .nullable(),
);

/* ------------------------------------------------------------------ */
/* Entities                                                            */
/* ------------------------------------------------------------------ */

export const programmeSchema = z.object({
  id,
  title: z.string().trim().min(1, "Title is required").max(200),
  slug,
  summary: text(600),
  description: z.string().max(100000).default("").transform(sanitizeRichText),
  icon: text(40),
  cover_image: imageRefSchema,
  status: z.enum(["proposed", "pilot", "active", "completed"]),
  category: text(80),
  sort_order: sortOrder,
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  seo_title: text(200),
  seo_description: text(320),
});

export const articleSchema = z
  .object({
    id,
    title: z.string().trim().min(1, "Title is required").max(250),
    slug,
    excerpt: text(600),
    content: z.string().max(200000).default("").transform(sanitizeRichText),
    featured_image: imageRefSchema,
    gallery: z.array(imageObject).max(40).default([]),
    video_url: url,
    category_id: z.string().uuid().nullable().default(null),
    author_name: text(120),
    status: z.enum(["draft", "published"]),
    published_at: z.string().datetime({ offset: true }).nullable().default(null),
    is_featured: z.boolean().default(false),
    seo_title: text(200),
    seo_description: text(320),
  })
  .transform((a) => ({
    ...a,
    // Publishing without a date publishes immediately.
    published_at: a.status === "published" && !a.published_at ? new Date().toISOString() : a.published_at,
  }));

export const categorySchema = z.object({
  id,
  name: z.string().trim().min(1, "Name is required").max(80),
  slug,
  description: text(300),
  sort_order: sortOrder,
});

export const teamMemberSchema = z.object({
  id,
  name: z.string().trim().min(1, "Name is required").max(120),
  role: text(120),
  bio: text(2000),
  photo: imageRefSchema,
  social_links: socialLinks,
  sort_order: sortOrder,
  is_visible: z.boolean().default(false),
});

export const partnerSchema = z.object({
  id,
  name: z.string().trim().min(1, "Name is required").max(200),
  description: text(1000),
  logo: imageRefSchema,
  website_url: url,
  relationship: z.enum(["prospective", "confirmed", "supporting"]),
  is_visible: z.boolean().default(false),
  sort_order: sortOrder,
});

export const statisticSchema = z.object({
  id,
  label: z.string().trim().min(1, "Label is required").max(120),
  value: z.coerce.number().min(-1e12).max(1e12),
  prefix: text(10),
  suffix: text(20),
  description: text(300),
  icon: text(40),
  status: z.enum(["target", "ongoing", "achieved", "verified"]),
  target_value: z.preprocess((v) => (v === "" || v === undefined ? null : v), z.coerce.number().min(0).max(1e12).nullable()),
  as_of: dateOrNull,
  source_note: text(300),
  is_visible: z.boolean().default(true),
  sort_order: sortOrder,
});

/* Biodiversity explorer, labs, projects, observatory */

export const ecosystemSchema = z.object({
  id,
  name: z.string().trim().min(1, "Name is required").max(120),
  slug,
  zone: z.enum(["lake", "montane_forest", "hills", "wetland", "savanna"]),
  elevation: text(60),
  summary: text(400),
  description: richText,
  processes: text(1000),
  example_places: text(300),
  photo: imageRefSchema,
  sort_order: sortOrder,
  is_published: z.boolean().default(false),
});

export const bioCategorySchema = z.object({
  id,
  name: z.string().trim().min(1, "Name is required").max(80),
  slug,
  description: text(300),
  icon: text(40),
  sort_order: sortOrder,
});

export const speciesSchema = z.object({
  id,
  common_name: z.string().trim().min(1, "Common name is required").max(160),
  slug,
  scientific_name: text(160),
  local_name: text(160),
  category_id: uuidOrNull,
  ecosystem_id: uuidOrNull,
  entry_type: z.enum(["reference", "abc_observation"]),
  photo: imageRefSchema,
  summary: text(400),
  description: richText,
  habitat: text(1000),
  ecological_role: text(1000),
  conservation_status: z.enum(["", "LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD", "NE"]).default(""),
  conservation_notes: text(1000),
  sources: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Each source needs a name").max(160),
        url: z
          .string()
          .trim()
          .max(500)
          .regex(/^https?:\/\/[^\s]+$/i, "Source links must start with https://"),
      }),
    )
    .max(12)
    .default([]),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]),
  sort_order: sortOrder,
});

export const natureLabSchema = z.object({
  id,
  name: z.string().trim().min(1, "Name is required").max(160),
  slug,
  summary: text(400),
  description: richText,
  status: z.enum(["proposed", "establishing", "active", "paused"]),
  host: text(200),
  region: text(120),
  focus: text(200),
  cover_image: imageRefSchema,
  sort_order: sortOrder,
  is_published: z.boolean().default(false),
});

export const projectSchema = z
  .object({
    id,
    title: z.string().trim().min(1, "Title is required").max(200),
    slug,
    summary: text(500),
    description: richText,
    research_question: text(400),
    methods: text(3000),
    participation: text(1000),
    findings: richText,
    status: z.enum(["proposed", "planned", "active", "completed"]),
    lab_id: uuidOrNull,
    cover_image: imageRefSchema,
    starts_on: dateOrNull,
    ends_on: dateOrNull,
    sort_order: sortOrder,
    is_published: z.boolean().default(false),
  })
  .refine((p) => !p.starts_on || !p.ends_on || p.ends_on >= p.starts_on, { message: "The end date cannot be before the start date", path: ["ends_on"] });

export const milestoneSchema = z.object({
  id,
  title: z.string().trim().min(1, "Title is required").max(160),
  description: text(400),
  period: text(80),
  status: z.enum(["planned", "in_progress", "done"]),
  sort_order: sortOrder,
  is_visible: z.boolean().default(true),
});

/** Moderation of a community observation. Administrators may also correct or enter records. */
export const observationAdminSchema = z.object({
  id,
  category: z.enum(["bird", "plant", "insect", "mammal", "amphibian_reptile", "fungus", "habitat", "other"]),
  what: z.string().trim().min(1, "Say what was observed").max(200),
  notes: text(3000),
  general_area: text(120),
  observed_on: dateOrNull,
  observer_name: text(120),
  observer_email: z.union([z.literal(""), z.string().trim().email().max(320)]).default(""),
  credit_name: z.boolean().default(false),
  consent: z.boolean().default(false),
  is_minor: z.boolean().default(false),
  status: z.enum(["pending", "approved", "rejected"]),
  moderator_note: text(1000),
});

const hex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour, e.g. #173D32");

export const settingsSchema = z.object({
  org_name: z.string().trim().min(1).max(200),
  short_name: text(40),
  tagline: text(200),
  description: text(1000),
  logo: imageRefSchema,
  favicon_url: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .default(null)
    .refine((v) => !v || v.startsWith("/") || /^https:\/\//.test(v), "Favicon must be a site path or https URL"),
  brand_colors: z.object({ forest: hex, evergreen: hex, sage: hex, ivory: hex, earth: hex, charcoal: hex }),
  seo_title: text(200),
  seo_description: text(320),
  og_image: imageRefSchema,
  contact_email: z.union([z.literal(""), z.string().trim().email().max(320)]).default(""),
  contact_phone: text(60),
  address: text(500),
  location_note: text(500),
  social_links: socialLinks,
  footer_description: text(600),
  copyright_text: text(300),
  newsletter_enabled: z.boolean().default(true),
  newsletter_heading: text(120),
  newsletter_text: text(500),
  header_cta_label: text(40),
  header_cta_href: z.string().max(500).default("").transform(safeHref),
  observations_open: z.boolean().default(false),
});

export const navigationItemSchema = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(1, "Every link needs a label").max(80),
  href: z.string().max(500).default("").transform(safeHref),
  parent_id: z.string().uuid().nullable(),
  sort_order: sortOrder,
  is_visible: z.boolean().default(true),
  open_in_new_tab: z.boolean().default(false),
});

export const mediaUpdateSchema = z.object({
  id: z.string().uuid(),
  alt_text: text(300),
  caption: text(500),
  credit: text(300),
  source_url: url,
  folder: z.string().trim().min(1).max(60).default("General"),
});

export const mediaCreateSchema = z.object({
  url: z.string().trim().max(1000).regex(/^https:\/\/[^\s]+$/i, "Media URL must use https"),
  storage_path: z.string().min(1).max(500),
  file_name: z.string().max(300),
  mime_type: z.string().max(100),
  size_bytes: z.number().int().min(0),
  width: z.number().int().positive().nullable().default(null),
  height: z.number().int().positive().nullable().default(null),
  alt_text: text(300),
  credit: text(300),
  folder: z.string().trim().min(1).max(60).default("General"),
});

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

const MAX_TEXT = 4000;

function cleanImage(value: unknown) {
  const parsed = imageRefSchema.safeParse(value ?? null);
  return parsed.success ? parsed.data : null;
}

function cleanLink(value: unknown) {
  const v = (value ?? {}) as { label?: unknown; href?: unknown };
  return {
    label: typeof v.label === "string" ? v.label.trim().slice(0, 120) : "",
    href: safeHref(v.href),
  };
}

function cleanField(field: Field, value: unknown): unknown {
  switch (field.kind) {
    case "text":
    case "icon":
      return typeof value === "string" ? value.slice(0, 500) : "";
    case "textarea":
      return typeof value === "string" ? value.slice(0, MAX_TEXT) : "";
    case "richtext":
      return sanitizeRichText(typeof value === "string" ? value.slice(0, 100000) : "");
    case "image":
      return cleanImage(value);
    case "link":
      return cleanLink(value);
    case "number": {
      const n = Number(value);
      if (!Number.isFinite(n)) return field.min ?? 0;
      return Math.min(field.max ?? 1e9, Math.max(field.min ?? -1e9, n));
    }
    case "boolean":
      return value === true;
    case "date":
      return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
    case "select":
      return field.options.some((o) => o.value === value) ? value : field.options[0]?.value ?? "";
    case "list":
      return (Array.isArray(value) ? value : []).slice(0, 60).map((item) => cleanFields(field.fields, item));
  }
}

function cleanFields(fields: Field[], data: unknown): Record<string, unknown> {
  const src = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.name] = cleanField(f, src[f.name]);
  return out;
}

/** Validates and sanitises an array of blocks against the block registry. */
export function sanitizeBlocks(input: unknown): Block[] {
  if (!Array.isArray(input)) throw new Error("Sections must be a list.");
  if (input.length > 60) throw new Error("A page can have at most 60 sections.");
  return input.map((raw, i) => {
    const b = (raw ?? {}) as Partial<Block>;
    if (!b.type || !BLOCK_TYPES.includes(b.type as BlockType)) throw new Error(`Section ${i + 1} has an unknown type.`);
    const def = BLOCKS[b.type as BlockType];
    const idOk = typeof b.id === "string" && /^[0-9a-f-]{36}$/i.test(b.id);
    const anchorRaw = typeof b.data?.anchor === "string" ? b.data.anchor : "";
    return {
      id: idOk ? (b.id as string) : crypto.randomUUID(),
      type: def.type,
      visible: b.visible !== false,
      data: {
        ...cleanFields(def.fields, b.data),
        anchor: anchorRaw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60),
      },
    };
  });
}

export const pageSchema = z.object({
  id,
  title: z.string().trim().min(1, "Title is required").max(200),
  slug: slug.refine((s) => !RESERVED_SLUGS.includes(s) || ["programmes", "stories"].includes(s), "This address is reserved"),
  description: text(600),
  hero_eyebrow: text(120),
  hero_image: imageRefSchema,
  status: z.enum(["draft", "published"]),
  seo_title: text(200),
  seo_description: text(320),
  sections: z.unknown().transform(sanitizeBlocks),
});
