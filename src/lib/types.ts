/**
 * Shared content types for the ABC website and CMS.
 * Keep this file free of runtime imports: it is also consumed by the
 * Node seed scripts (via native TypeScript type stripping).
 */

export type ImageRef = {
  src: string;
  alt: string;
  credit?: string;
};

export type LinkRef = {
  label: string;
  href: string;
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type PublishStatus = "draft" | "published";

export type BrandColors = {
  forest: string;
  evergreen: string;
  sage: string;
  ivory: string;
  earth: string;
  charcoal: string;
};

export type SiteSettings = {
  org_name: string;
  short_name: string;
  tagline: string;
  description: string;
  logo: ImageRef | null;
  favicon_url: string | null;
  brand_colors: BrandColors;
  seo_title: string;
  seo_description: string;
  og_image: ImageRef | null;
  contact_email: string;
  contact_phone: string;
  address: string;
  location_note: string;
  social_links: SocialLink[];
  footer_description: string;
  copyright_text: string;
  newsletter_enabled: boolean;
  newsletter_heading: string;
  newsletter_text: string;
  header_cta_label: string;
  header_cta_href: string;
  /** When false the public observation form is closed and says so. */
  observations_open: boolean;
  updated_at?: string;
};

export type NavLocation = "header" | "footer";

export type NavigationItem = {
  id: string;
  location: NavLocation;
  label: string;
  href: string;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  open_in_new_tab: boolean;
};

export type NavTreeItem = NavigationItem & { children: NavigationItem[] };

export type ProgrammeStatus = "proposed" | "pilot" | "active" | "completed";

export type Programme = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  icon: string;
  cover_image: ImageRef | null;
  status: ProgrammeStatus;
  category: string;
  sort_order: number;
  is_published: boolean;
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
  created_at?: string;
  updated_at?: string;
};

export type ArticleCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: ImageRef | null;
  gallery: ImageRef[];
  video_url: string;
  category_id: string | null;
  author_name: string;
  status: PublishStatus;
  published_at: string | null;
  is_featured: boolean;
  seo_title: string;
  seo_description: string;
  created_at?: string;
  updated_at?: string;
  category?: ArticleCategory | null;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: ImageRef | null;
  social_links: SocialLink[];
  sort_order: number;
  is_visible: boolean;
};

export type PartnerRelationship = "prospective" | "confirmed" | "supporting";

export type Partner = {
  id: string;
  name: string;
  description: string;
  logo: ImageRef | null;
  website_url: string;
  relationship: PartnerRelationship;
  is_visible: boolean;
  sort_order: number;
};

export type StatisticStatus = "target" | "ongoing" | "achieved" | "verified";

export type ImpactStatistic = {
  id: string;
  label: string;
  value: number;
  prefix: string;
  suffix: string;
  description: string;
  icon: string;
  status: StatisticStatus;
  /** Optional goal used to draw progress for ongoing or achieved figures. */
  target_value: number | null;
  /** Date the figure refers to (ISO date), shown publicly. */
  as_of: string | null;
  /** How the figure was established or verified. */
  source_note: string;
  is_visible: boolean;
  sort_order: number;
};

export type MediaAsset = {
  id: string;
  url: string;
  storage_path: string | null;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  caption: string;
  credit: string;
  source_url: string;
  folder: string;
  created_at?: string;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  description: string;
  hero_eyebrow: string;
  hero_image: ImageRef | null;
  sections: Block[];
  status: PublishStatus;
  is_system: boolean;
  seo_title: string;
  seo_description: string;
  updated_at?: string;
};

export type SubmissionStatus = "new" | "reviewed" | "resolved";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  organisation: string;
  subject: string;
  message: string;
  status: SubmissionStatus;
  created_at: string;
};

export type VolunteerApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  interest: string;
  organisation: string;
  availability: string;
  experience: string;
  message: string;
  status: SubmissionStatus;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | null;
  created_at?: string;
};

/* ------------------------------------------------------------------ */
/* Content blocks (used by the homepage and every CMS page)            */
/* ------------------------------------------------------------------ */

export type BlockType =
  | "hero"
  | "image_text"
  | "cards"
  | "steps"
  | "rich_text"
  | "statement"
  | "cta"
  | "statistics"
  | "programmes"
  | "stories"
  | "partners"
  | "team"
  | "form"
  | "contact_details"
  | "faq"
  | "gallery"
  | "atlas"
  | "species"
  | "nature_labs"
  | "projects"
  | "milestones"
  | "observations";

export type Block = {
  id: string;
  type: BlockType;
  visible: boolean;
  // Block data is validated against the block registry field specs.
  data: Record<string, unknown>;
};

export type HomepageSectionRow = {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  is_visible: boolean;
  sort_order: number;
  updated_at?: string;
};

/* ------------------------------------------------------------------ */
/* Biodiversity explorer, labs, projects, observatory                  */
/* ------------------------------------------------------------------ */

/** Position of an ecosystem on the west-to-east atlas transect. */
export type EcosystemZone = "lake" | "montane_forest" | "hills" | "wetland" | "savanna";

export type Ecosystem = {
  id: string;
  slug: string;
  name: string;
  zone: EcosystemZone;
  elevation: string;
  summary: string;
  description: string;
  processes: string;
  example_places: string;
  photo: ImageRef | null;
  sort_order: number;
  is_published: boolean;
};

export type BiodiversityCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
};

export type SourceRef = { label: string; url: string };

/** "reference" = educational information. "abc_observation" = recorded by ABC participants. */
export type SpeciesEntryType = "reference" | "abc_observation";

export type Species = {
  id: string;
  slug: string;
  common_name: string;
  scientific_name: string;
  local_name: string;
  category_id: string | null;
  ecosystem_id: string | null;
  entry_type: SpeciesEntryType;
  photo: ImageRef | null;
  summary: string;
  description: string;
  habitat: string;
  ecological_role: string;
  conservation_status: string;
  conservation_notes: string;
  sources: SourceRef[];
  is_featured: boolean;
  status: PublishStatus;
  sort_order: number;
  updated_at?: string;
  category?: BiodiversityCategory | null;
  ecosystem?: Ecosystem | null;
};

export type LabStatus = "proposed" | "establishing" | "active" | "paused";

export type NatureLab = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  status: LabStatus;
  host: string;
  region: string;
  focus: string;
  cover_image: ImageRef | null;
  sort_order: number;
  is_published: boolean;
};

export type ProjectKind = "citizen_science" | "research";
export type ProjectStatus = "proposed" | "planned" | "active" | "completed";

/** Shared shape of citizen_science_projects and research_projects rows. */
export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  research_question: string;
  methods: string;
  participation: string;
  findings: string;
  status: ProjectStatus;
  lab_id: string | null;
  cover_image: ImageRef | null;
  starts_on: string | null;
  ends_on: string | null;
  sort_order: number;
  is_published: boolean;
  updated_at?: string;
};

export type MilestoneStatus = "planned" | "in_progress" | "done";

export type Milestone = {
  id: string;
  title: string;
  description: string;
  period: string;
  status: MilestoneStatus;
  sort_order: number;
  is_visible: boolean;
};

export type ObservationStatus = "pending" | "approved" | "rejected";

export type Observation = {
  id: string;
  category: string;
  what: string;
  notes: string;
  general_area: string;
  observed_on: string | null;
  observer_name: string;
  observer_email: string;
  credit_name: boolean;
  consent: boolean;
  is_minor: boolean;
  status: ObservationStatus;
  moderator_note: string;
  created_at: string;
};

/** Public view of an approved observation (no contact details). */
export type PublicObservation = Pick<Observation, "id" | "category" | "what" | "notes" | "general_area" | "observed_on"> & {
  observer: string;
};

export type AuditEntry = {
  id: number;
  table_name: string;
  row_id: string;
  action: "insert" | "update" | "delete";
  label: string;
  actor_email: string;
  created_at: string;
};
