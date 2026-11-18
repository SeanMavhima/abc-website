"use client";

import * as React from "react";
import { ExternalLink, Pencil, Plus, Search, type LucideIcon } from "lucide-react";
import type { Field, FieldOption } from "@/lib/blocks";
import { deleteRecord, saveRecord, setRecordFlag, type RecordTable } from "@/lib/actions/admin/records";
import { getIcon } from "@/lib/icons";
import { IUCN_OPTIONS, LAB_STATUS, MILESTONE_STATUS, OBSERVATION_CATEGORIES, PROJECT_STATUS, STATISTIC_STATUS, observationCategoryLabel } from "@/lib/status";
import { formatDate, slugify } from "@/lib/utils";
import type { ImageRef } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/misc";
import { Input, Select, Switch } from "@/components/ui/form-controls";
import { FieldsEditor } from "./fields-editor";
import { ConfirmButton, EmptyState, useAction } from "./primitives";
import { ReorderableList } from "./reorderable-table";

type Row = { id: string } & Record<string, unknown>;

type Config = {
  table: RecordTable;
  singular: string;
  fields: Field[];
  newItem: Record<string, unknown>;
  title: (r: Row) => string;
  subtitle?: (r: Row) => React.ReactNode;
  thumb?: (r: Row) => string | undefined;
  icon?: (r: Row) => string | undefined;
  /** A quick on/off switch in the list. `isOn` is needed when the column is not a plain yes/no. */
  flag?: { field: string; on: string; off: string; isOn?: (r: Row) => boolean };
  sortable: boolean;
  emptyIcon: LucideIcon;
  emptyText: string;
  prepare?: (r: Row) => Row;
  /** Address of the public page for a row, when it has one and is visible to visitors. */
  viewHref?: (r: Row) => string | undefined;
  /** Extra text that the search box should match, besides the title. */
  searchText?: (r: Row) => string;
  /** A dropdown that narrows the list by one column. */
  filter?: { field: string; label: string; options: FieldOption[] };
};

const slugField: Field = {
  kind: "text",
  name: "slug",
  label: "Web address",
  help: "Lowercase letters, numbers and hyphens. Leave empty to generate it from the name.",
};

const fromRecord = (map: Record<string, { label: string }>): FieldOption[] => Object.entries(map).map(([value, v]) => ({ value, label: v.label }));

const badgeFor = (tone: string) => (tone === "solid" ? "success" : tone === "progress" ? "info" : "earth") as "success" | "info" | "earth";

/** Citizen science projects and research projects share one shape. */
function projectConfig(table: "citizen_science_projects" | "research_projects", singular: string, path: string, emptyText: string): Config {
  return {
    table,
    singular,
    sortable: true,
    emptyIcon: getIcon(table === "research_projects" ? "microscope" : "binoculars"),
    emptyText,
    fields: [
      { kind: "text", name: "title", label: "Title" },
      slugField,
      {
        kind: "select",
        name: "status",
        label: "Status",
        help: "Proposed and Planned mean nothing has started. Use Under way and Completed only when that is true.",
        options: fromRecord(PROJECT_STATUS),
      },
      { kind: "textarea", name: "summary", label: "Summary", rows: 3 },
      { kind: "text", name: "research_question", label: "Research question" },
      { kind: "richtext", name: "description", label: "Description" },
      { kind: "textarea", name: "methods", label: "Method", rows: 5, help: "One step per line." },
      { kind: "textarea", name: "participation", label: "Who takes part", rows: 2 },
      { kind: "richtext", name: "findings", label: "Findings", help: "Leave empty until there are real, checked results. The page then says that there are no findings yet." },
      { kind: "select", name: "lab_id", label: "Nature Lab (optional)", options: [] },
      { kind: "date", name: "starts_on", label: "Start date (optional)" },
      { kind: "date", name: "ends_on", label: "End date (optional)" },
      { kind: "image", name: "cover_image", label: "Photograph" },
      { kind: "boolean", name: "is_published", label: "Show on the website" },
    ],
    newItem: {
      title: "", slug: "", status: "proposed", summary: "", research_question: "", description: "", methods: "", participation: "",
      findings: "", lab_id: null, starts_on: null, ends_on: null, cover_image: null, is_published: false,
    },
    title: (r) => String(r.title || "Untitled"),
    subtitle: (r) => {
      const st = PROJECT_STATUS[String(r.status) as keyof typeof PROJECT_STATUS];
      return st ? <Badge variant={badgeFor(st.tone)}>{st.label}</Badge> : null;
    },
    thumb: (r) => (r.cover_image as ImageRef | null)?.src,
    flag: { field: "is_published", on: "Published", off: "Draft" },
    prepare: (r) => ({ ...r, slug: slugify(String(r.slug || r.title || "")) }),
    viewHref: (r) => (r.is_published && r.slug ? `${path}/${r.slug}` : undefined),
    filter: { field: "status", label: "Status", options: fromRecord(PROJECT_STATUS) },
  };
}

const social: Field = {
  kind: "list",
  name: "social_links",
  label: "Social media links",
  itemLabel: "Link",
  titleField: "platform",
  fields: [
    { kind: "text", name: "platform", label: "Platform", placeholder: "LinkedIn, X, Instagram, Facebook, YouTube or Website" },
    { kind: "text", name: "url", label: "Full web address", placeholder: "https://..." },
  ],
  newItem: { platform: "", url: "" },
};

const RELATIONSHIP_LABEL: Record<string, string> = {
  prospective: "Prospective collaborator",
  confirmed: "Confirmed partner",
  supporting: "Supporting organisation",
};

export const COLLECTIONS = {
  team: {
    table: "team_members",
    singular: "team member",
    sortable: true,
    emptyIcon: getIcon("users"),
    emptyText: "Add real team members only. Profiles stay hidden until you switch them on.",
    fields: [
      { kind: "text", name: "name", label: "Full name" },
      { kind: "text", name: "role", label: "Role" },
      { kind: "textarea", name: "bio", label: "Biography", rows: 4 },
      { kind: "image", name: "photo", label: "Profile photograph" },
      social,
      { kind: "boolean", name: "is_visible", label: "Show on the website" },
    ],
    newItem: { name: "", role: "", bio: "", photo: null, social_links: [], is_visible: false },
    title: (r) => String(r.name || "Unnamed"),
    subtitle: (r) => String(r.role || ""),
    thumb: (r) => (r.photo as ImageRef | null)?.src,
    flag: { field: "is_visible", on: "Visible", off: "Hidden" },
  },
  partners: {
    table: "partners",
    singular: "organisation",
    sortable: true,
    emptyIcon: getIcon("handshake"),
    emptyText: "Add organisations and choose their relationship to ABC.",
    fields: [
      { kind: "text", name: "name", label: "Organisation name" },
      {
        kind: "select",
        name: "relationship",
        label: "Relationship",
        help: "Only choose 'Confirmed partner' when a partnership exists and you have permission to use their name and logo.",
        options: [
          { value: "prospective", label: "Prospective collaborator" },
          { value: "confirmed", label: "Confirmed partner" },
          { value: "supporting", label: "Supporting organisation" },
        ],
      },
      { kind: "textarea", name: "description", label: "Description", rows: 3 },
      { kind: "image", name: "logo", label: "Logo", help: "Upload a logo only with the organisation's permission." },
      { kind: "text", name: "website_url", label: "Website", placeholder: "https://..." },
      { kind: "boolean", name: "is_visible", label: "Show on the website" },
    ],
    newItem: { name: "", relationship: "prospective", description: "", logo: null, website_url: "", is_visible: false },
    title: (r) => String(r.name || "Unnamed"),
    subtitle: (r) => (
      <Badge variant={r.relationship === "confirmed" ? "success" : r.relationship === "supporting" ? "info" : "muted"}>
        {RELATIONSHIP_LABEL[String(r.relationship)] ?? String(r.relationship)}
      </Badge>
    ),
    thumb: (r) => (r.logo as ImageRef | null)?.src,
    flag: { field: "is_visible", on: "Visible", off: "Hidden" },
  },
  statistics: {
    table: "impact_statistics",
    singular: "statistic",
    sortable: true,
    emptyIcon: getIcon("target"),
    emptyText: "Add targets or verified results. Never present targets as achievements.",
    fields: [
      { kind: "text", name: "label", label: "Label", placeholder: "e.g. Youth researchers" },
      { kind: "number", name: "value", label: "Number", step: 1 },
      { kind: "text", name: "prefix", label: "Prefix (optional)", placeholder: "e.g. ~" },
      { kind: "text", name: "suffix", label: "Unit or suffix (optional)", placeholder: "e.g. +, %, ha" },
      { kind: "text", name: "description", label: "Short description" },
      {
        kind: "select",
        name: "status",
        label: "Status",
        help: "Proposed target = a goal, nothing achieved yet. Ongoing = work under way. Achieved = a recorded result. Verified = an achieved result that has been checked.",
        options: fromRecord(STATISTIC_STATUS),
      },
      { kind: "number", name: "target_value", label: "Goal for the progress bar (optional)", step: 1, min: 0, help: "Only used for Ongoing, Achieved or Verified figures. Leave empty for no progress bar." },
      { kind: "date", name: "as_of", label: "Date the figure refers to (optional)", help: "Shown as 'As of' beside the figure. Recommended for anything other than a target." },
      { kind: "text", name: "source_note", label: "Source or explanation (optional)", placeholder: "e.g. Attendance registers, both pilot sites" },
      { kind: "icon", name: "icon", label: "Icon" },
      { kind: "boolean", name: "is_visible", label: "Show on the website" },
    ],
    newItem: {
      label: "", value: 0, prefix: "", suffix: "", description: "", status: "target", target_value: null, as_of: null, source_note: "",
      icon: "target", is_visible: true,
    },
    title: (r) => `${r.prefix ?? ""}${Number(r.value ?? 0).toLocaleString("en-GB")}${r.suffix ?? ""}  ${r.label ?? ""}`,
    subtitle: (r) => (
      <Badge variant={badgeFor(STATISTIC_STATUS[String(r.status) as keyof typeof STATISTIC_STATUS]?.tone ?? "outline")}>
        {STATISTIC_STATUS[String(r.status) as keyof typeof STATISTIC_STATUS]?.label ?? String(r.status)}
      </Badge>
    ),
    icon: (r) => String(r.icon || "target"),
    flag: { field: "is_visible", on: "Visible", off: "Hidden" },
  },
  categories: {
    table: "article_categories",
    singular: "category",
    sortable: true,
    emptyIcon: getIcon("newspaper"),
    emptyText: "Categories help visitors filter stories.",
    fields: [
      { kind: "text", name: "name", label: "Name" },
      { kind: "text", name: "slug", label: "Web address", help: "Used in filter links, e.g. field-notes. Leave empty to generate from the name." },
      { kind: "textarea", name: "description", label: "Description", rows: 2 },
    ],
    newItem: { name: "", slug: "", description: "" },
    title: (r) => String(r.name || "Unnamed"),
    subtitle: (r) => <span className="font-mono text-xs text-muted-foreground">{String(r.slug ?? "")}</span>,
    prepare: (r) => ({ ...r, slug: slugify(String(r.slug || r.name || "")) }),
  },
  atlas: {
    table: "ecosystems",
    singular: "habitat",
    sortable: true,
    emptyIcon: getIcon("mountain"),
    emptyText: "Habitats appear on the Living Atlas cross-section.",
    fields: [
      { kind: "text", name: "name", label: "Name" },
      slugField,
      {
        kind: "select",
        name: "zone",
        label: "Position on the atlas drawing",
        help: "The drawing has five fixed positions from west to east. Each habitat is shown at one of them.",
        options: [
          { value: "lake", label: "Lake (far west)" },
          { value: "montane_forest", label: "Mountain forest" },
          { value: "hills", label: "Hills" },
          { value: "wetland", label: "Wetland" },
          { value: "savanna", label: "Savanna (far east)" },
        ],
      },
      { kind: "text", name: "elevation", label: "Height above sea level", placeholder: "e.g. About 1,600 to 2,950 m" },
      { kind: "textarea", name: "summary", label: "Summary", rows: 2 },
      { kind: "richtext", name: "description", label: "Description" },
      { kind: "textarea", name: "processes", label: "How it works", rows: 4, help: "Ecological processes, one per line." },
      { kind: "text", name: "example_places", label: "Where to find it", help: "Name well-known public places only. Never give the location of a sensitive species." },
      { kind: "image", name: "photo", label: "Photograph" },
      { kind: "boolean", name: "is_published", label: "Show on the website" },
    ],
    newItem: { name: "", slug: "", zone: "hills", elevation: "", summary: "", description: "", processes: "", example_places: "", photo: null, is_published: false },
    title: (r) => String(r.name || "Unnamed"),
    subtitle: (r) => String(r.elevation || ""),
    thumb: (r) => (r.photo as ImageRef | null)?.src,
    flag: { field: "is_published", on: "Published", off: "Draft" },
    prepare: (r) => ({ ...r, slug: slugify(String(r.slug || r.name || "")) }),
    viewHref: (r) => (r.is_published && r.slug ? `/explorer#${r.slug}` : undefined),
  },
  speciesGroups: {
    table: "biodiversity_categories",
    singular: "group",
    sortable: true,
    emptyIcon: getIcon("bird"),
    emptyText: "Groups such as Birds, Mammals, Insects and Plants let visitors filter species.",
    fields: [
      { kind: "text", name: "name", label: "Name" },
      slugField,
      { kind: "textarea", name: "description", label: "Description", rows: 2 },
      { kind: "icon", name: "icon", label: "Icon" },
    ],
    newItem: { name: "", slug: "", description: "", icon: "leaf" },
    title: (r) => String(r.name || "Unnamed"),
    subtitle: (r) => <span className="font-mono text-xs text-muted-foreground">{String(r.slug ?? "")}</span>,
    icon: (r) => String(r.icon || "leaf"),
    prepare: (r) => ({ ...r, slug: slugify(String(r.slug || r.name || "")) }),
  },
  species: {
    table: "species",
    singular: "species entry",
    sortable: true,
    emptyIcon: getIcon("bird"),
    emptyText: "Add species to the Biodiversity Explorer. Check names and conservation status against a reliable source first.",
    fields: [
      { kind: "text", name: "common_name", label: "Common name" },
      { kind: "text", name: "scientific_name", label: "Scientific name", help: "Enter it only if you have verified it. Shown in italics." },
      { kind: "text", name: "local_name", label: "Name in Kinyarwanda (optional)" },
      slugField,
      {
        kind: "select",
        name: "entry_type",
        label: "Type of entry",
        help: "Choose 'ABC field observation' only for a species actually recorded by ABC participants. Everything else is reference information.",
        options: [
          { value: "reference", label: "Educational reference" },
          { value: "abc_observation", label: "ABC field observation" },
        ],
      },
      { kind: "select", name: "category_id", label: "Group", options: [] },
      { kind: "select", name: "ecosystem_id", label: "Main habitat", options: [] },
      { kind: "image", name: "photo", label: "Photograph", help: "Use your own photograph or an openly licensed one, and fill in its credit in the Media library." },
      { kind: "textarea", name: "summary", label: "One-sentence summary", rows: 2 },
      { kind: "richtext", name: "description", label: "Description" },
      { kind: "textarea", name: "habitat", label: "Where it lives", rows: 2, help: "Describe the habitat. Never give precise locations of threatened species." },
      { kind: "textarea", name: "ecological_role", label: "Its role in the ecosystem", rows: 3 },
      { kind: "select", name: "conservation_status", label: "IUCN Red List category", help: "Check iucnredlist.org. Leave as 'Not stated' if you are unsure.", options: IUCN_OPTIONS },
      { kind: "textarea", name: "conservation_notes", label: "Conservation notes", rows: 3 },
      {
        kind: "list",
        name: "sources",
        label: "Sources and further reading",
        itemLabel: "Source",
        titleField: "label",
        fields: [
          { kind: "text", name: "label", label: "Name of the source" },
          { kind: "text", name: "url", label: "Web address", placeholder: "https://..." },
        ],
        newItem: { label: "", url: "" },
      },
      { kind: "boolean", name: "is_featured", label: "Feature this species" },
      {
        kind: "select",
        name: "status",
        label: "Visibility",
        options: [
          { value: "draft", label: "Draft (hidden)" },
          { value: "published", label: "Published" },
        ],
      },
    ],
    newItem: {
      common_name: "", scientific_name: "", local_name: "", slug: "", entry_type: "reference", category_id: null, ecosystem_id: null, photo: null,
      summary: "", description: "", habitat: "", ecological_role: "", conservation_status: "", conservation_notes: "", sources: [],
      is_featured: false, status: "draft",
    },
    title: (r) => String(r.common_name || "Unnamed"),
    subtitle: (r) => (
      <span className="flex flex-wrap items-center gap-2">
        {r.scientific_name ? <em>{String(r.scientific_name)}</em> : null}
        {r.entry_type === "abc_observation" ? <Badge variant="success">ABC observation</Badge> : <Badge variant="muted">Reference</Badge>}
        {r.conservation_status ? <Badge variant="earth">{String(r.conservation_status)}</Badge> : null}
      </span>
    ),
    thumb: (r) => (r.photo as ImageRef | null)?.src,
    flag: { field: "status", on: "Published", off: "Draft", isOn: (r) => r.status === "published" },
    prepare: (r) => ({ ...r, slug: slugify(String(r.slug || r.common_name || "")) }),
    viewHref: (r) => (r.status === "published" && r.slug ? `/explorer/${r.slug}` : undefined),
    searchText: (r) => `${r.scientific_name ?? ""} ${r.local_name ?? ""}`,
    filter: {
      field: "entry_type",
      label: "Type",
      options: [
        { value: "reference", label: "Reference" },
        { value: "abc_observation", label: "ABC observation" },
      ],
    },
  },
  natureLabs: {
    table: "nature_labs",
    singular: "Nature Lab",
    sortable: true,
    emptyIcon: getIcon("map-pin"),
    emptyText: "Add a Nature Lab only once a site has been agreed with the community. Until then the website says that none has been established.",
    fields: [
      { kind: "text", name: "name", label: "Name" },
      slugField,
      {
        kind: "select",
        name: "status",
        label: "Status",
        help: "Use 'Active' only when regular activities are actually taking place.",
        options: fromRecord(LAB_STATUS),
      },
      { kind: "textarea", name: "summary", label: "Summary", rows: 2 },
      { kind: "richtext", name: "description", label: "Description" },
      { kind: "text", name: "region", label: "Region", help: "Keep this general, such as a district. Do not publish a precise location without the community's agreement." },
      { kind: "text", name: "host", label: "Hosted with", help: "Name a school, group or institution only with their permission." },
      { kind: "text", name: "focus", label: "Focus", placeholder: "e.g. Wetland birds and plants" },
      { kind: "image", name: "cover_image", label: "Photograph" },
      { kind: "boolean", name: "is_published", label: "Show on the website" },
    ],
    newItem: { name: "", slug: "", status: "proposed", summary: "", description: "", region: "", host: "", focus: "", cover_image: null, is_published: false },
    title: (r) => String(r.name || "Unnamed"),
    subtitle: (r) => {
      const st = LAB_STATUS[String(r.status) as keyof typeof LAB_STATUS];
      return st ? <Badge variant={badgeFor(st.tone)}>{st.label}</Badge> : null;
    },
    thumb: (r) => (r.cover_image as ImageRef | null)?.src,
    flag: { field: "is_published", on: "Published", off: "Draft" },
    prepare: (r) => ({ ...r, slug: slugify(String(r.slug || r.name || "")) }),
    viewHref: (r) => (r.is_published ? "/nature-labs#sites" : undefined),
  },
  citizenScience: projectConfig(
    "citizen_science_projects",
    "citizen science project",
    "/citizen-science",
    "Describe recording activities that communities can take part in. Mark them Proposed until they begin.",
  ),
  research: projectConfig(
    "research_projects",
    "research project",
    "/research",
    "Add a research project once its question has been agreed with the community. Leave Findings empty until there are checked results.",
  ),
  milestones: {
    table: "milestones",
    singular: "milestone",
    sortable: true,
    emptyIcon: getIcon("calendar"),
    emptyText: "Milestones form the timeline in Milestones sections.",
    fields: [
      { kind: "text", name: "title", label: "Title" },
      { kind: "textarea", name: "description", label: "Description", rows: 2 },
      { kind: "text", name: "period", label: "When", placeholder: "e.g. Month 1 to 2, or March 2027" },
      {
        kind: "select",
        name: "status",
        label: "Status",
        help: "Mark a milestone In progress or Done only when that is true.",
        options: fromRecord(MILESTONE_STATUS),
      },
      { kind: "boolean", name: "is_visible", label: "Show on the website" },
    ],
    newItem: { title: "", description: "", period: "", status: "planned", is_visible: true },
    title: (r) => String(r.title || "Untitled"),
    subtitle: (r) => {
      const st = MILESTONE_STATUS[String(r.status) as keyof typeof MILESTONE_STATUS];
      return (
        <span className="flex flex-wrap items-center gap-2">
          {st ? <Badge variant={badgeFor(st.tone)}>{st.label}</Badge> : null}
          {r.period ? <span>{String(r.period)}</span> : null}
        </span>
      );
    },
    flag: { field: "is_visible", on: "Visible", off: "Hidden" },
  },
  observations: {
    table: "observations",
    singular: "observation",
    sortable: false,
    emptyIcon: getIcon("eye"),
    emptyText: "Observations sent by the public appear here for review. You can also enter records from paper sheets.",
    fields: [
      {
        kind: "select",
        name: "status",
        label: "Decision",
        help: "Only approved observations, submitted with consent, appear on the website. Contact details are never shown.",
        options: [
          { value: "pending", label: "Waiting for review" },
          { value: "approved", label: "Approved for publication" },
          { value: "rejected", label: "Rejected" },
        ],
      },
      { kind: "textarea", name: "moderator_note", label: "Reviewer's note (private)", rows: 2 },
      { kind: "select", name: "category", label: "Kind", options: OBSERVATION_CATEGORIES.map((c) => ({ value: c.value, label: c.label })) },
      { kind: "text", name: "what", label: "What was observed", help: "You may correct the name once the identification has been checked." },
      { kind: "textarea", name: "notes", label: "Notes", rows: 3 },
      { kind: "text", name: "general_area", label: "General area", help: "Remove anything that pinpoints a sensitive species or a person's home." },
      { kind: "date", name: "observed_on", label: "Date seen" },
      { kind: "text", name: "observer_name", label: "Observer's name" },
      { kind: "text", name: "observer_email", label: "Observer's email (private)" },
      { kind: "boolean", name: "credit_name", label: "Observer asked to be credited by name" },
      { kind: "boolean", name: "is_minor", label: "Observer is under 18", help: "Their name is never published." },
      { kind: "boolean", name: "consent", label: "Consent to review and publication was given", help: "Without consent the observation is never shown, even if approved." },
    ],
    newItem: {
      status: "pending", moderator_note: "", category: "bird", what: "", notes: "", general_area: "", observed_on: null, observer_name: "",
      observer_email: "", credit_name: false, is_minor: false, consent: false,
    },
    title: (r) => String(r.what || "Observation"),
    subtitle: (r) => (
      <span className="flex flex-wrap items-center gap-2">
        <Badge variant={r.status === "approved" ? "success" : r.status === "rejected" ? "muted" : "earth"}>
          {r.status === "approved" ? "Approved" : r.status === "rejected" ? "Rejected" : "Waiting for review"}
        </Badge>
        <span>{observationCategoryLabel(String(r.category))}</span>
        {r.created_at ? <span>Received {formatDate(String(r.created_at))}</span> : null}
        {!r.consent ? <Badge variant="muted">No consent</Badge> : null}
      </span>
    ),
    searchText: (r) => `${r.notes ?? ""} ${r.general_area ?? ""} ${r.observer_name ?? ""}`,
    filter: {
      field: "status",
      label: "Decision",
      options: [
        { value: "pending", label: "Waiting for review" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
    },
  },
} satisfies Record<string, Config>;

export type CollectionKind = keyof typeof COLLECTIONS;

export function CollectionManager({
  kind,
  items,
  options,
}: {
  kind: CollectionKind;
  items: Row[];
  /** Choices for dropdowns that list other records, keyed by field name (for example the Group of a species). */
  options?: Record<string, FieldOption[]>;
}) {
  const config: Config = COLLECTIONS[kind];
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("");
  const { run, pending } = useAction();

  const fields = React.useMemo(
    () =>
      config.fields.map((field) =>
        field.kind === "select" && options?.[field.name] ? { ...field, options: [{ value: "", label: "None" }, ...options[field.name]] } : field,
      ),
    [config.fields, options],
  );

  const q = query.trim().toLowerCase();
  const visible = items.filter(
    (item) =>
      (!filter || String(item[config.filter?.field ?? ""]) === filter) &&
      (!q || `${config.title(item)} ${config.searchText?.(item) ?? ""}`.toLowerCase().includes(q)),
  );
  const narrowed = Boolean(q || filter);

  async function save() {
    if (!editing) return;
    const { created_at: _c, updated_at: _u, ...rest } = editing;
    void _c;
    void _u;
    // Dropdowns that point at another record use "" for "None"; the database stores that as empty.
    for (const field of fields) {
      if (field.kind === "select" && options?.[field.name] && rest[field.name] === "") rest[field.name] = null;
    }
    const payload = config.prepare ? config.prepare(rest as Row) : rest;
    const res = await run(saveRecord(config.table, { ...payload, id: editing.id || undefined }));
    if (res.ok) setEditing(null);
  }

  const row = (item: Row, controls: React.ReactNode) => {
    const thumb = config.thumb?.(item);
    const iconName = config.icon?.(item);
    const Icon = iconName ? getIcon(iconName) : null;
    return (
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
        {controls}
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
          <img src={thumb} alt="" className="size-11 shrink-0 rounded-lg bg-muted object-cover" />
        ) : Icon ? (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-sage/25 text-forest">
            <Icon className="size-5" />
          </span>
        ) : null}
        <button type="button" onClick={() => setEditing(structuredClone(item))} className="min-w-0 flex-1 text-left">
          <span className="block truncate font-medium hover:text-evergreen">{config.title(item)}</span>
          {config.subtitle ? <span className="mt-0.5 block text-sm text-muted-foreground">{config.subtitle(item)}</span> : null}
        </button>
        {config.flag ? (
          <Switch
            label={(config.flag.isOn ? config.flag.isOn(item) : Boolean(item[config.flag.field])) ? config.flag.on : config.flag.off}
            checked={config.flag.isOn ? config.flag.isOn(item) : Boolean(item[config.flag.field])}
            onCheckedChange={(v) => run(setRecordFlag(config.table, item.id, config.flag!.field, v))}
          />
        ) : null}
        {config.viewHref?.(item) ? (
          <Button asChild variant="ghost" size="icon-sm">
            <a href={config.viewHref(item)} target="_blank" rel="noopener noreferrer" aria-label={`View ${config.title(item)} on the website (opens in a new tab)`} title="View on the website">
              <ExternalLink />
            </a>
          </Button>
        ) : null}
        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${config.title(item)}`} onClick={() => setEditing(structuredClone(item))}>
          <Pencil />
        </Button>
        <ConfirmButton title={`Delete this ${config.singular}?`} onConfirm={() => run(deleteRecord(config.table, item.id))} />
      </div>
    );
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {items.length > 5 || config.filter ? (
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block sm:w-72">
              <span className="sr-only">Search {config.singular}s</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="pl-9" />
            </label>
            {config.filter ? (
              <label className="block sm:w-56">
                <span className="sr-only">Filter by {config.filter.label.toLowerCase()}</span>
                <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="">{config.filter.label}: all</option>
                  {config.filter.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </label>
            ) : null}
          </div>
        ) : (
          <span />
        )}
        <Button onClick={() => setEditing({ id: "", ...structuredClone(config.newItem) })}>
          <Plus /> Add {config.singular}
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={<config.emptyIcon />} title={`No ${config.singular}s yet`} description={config.emptyText} />
      ) : visible.length === 0 ? (
        <EmptyState icon={<Search />} title="Nothing matches" description="Try a different search or filter." />
      ) : config.sortable && !narrowed ? (
        <ReorderableList table={config.table} items={items} renderRow={row} />
      ) : (
        <>
          {config.sortable ? <p className="mb-2 text-xs text-muted-foreground">Clear the search to change the order.</p> : null}
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
            {visible.map((i) => (
              <li key={i.id}>{row(i, null)}</li>
            ))}
          </ul>
        </>
      )}
      <Dialog
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.id ? `Edit ${config.singular}` : `New ${config.singular}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={pending}>
              Save
            </Button>
          </>
        }
      >
        {editing ? <FieldsEditor fields={fields} value={editing} onChange={(v) => setEditing(v as Row)} /> : null}
      </Dialog>
    </>
  );
}
