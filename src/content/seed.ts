/**
 * Seed content for the ABC website, based on the ABC project proposal.
 *
 * This single source is used for:
 *  - populating Supabase (`npm run seed` / `npm run seed:sql`), and
 *  - rendering the public site in development preview mode, when Supabase
 *    is not configured yet.
 *
 * Accuracy rules followed here (see README):
 *  - ABC is presented as a PROPOSED youth-led initiative.
 *  - The six-month, two-site Rwanda pilot is PROPOSED, not completed.
 *  - Statistics are clearly labelled PROPOSED TARGETS.
 *  - Potential collaborators are seeded as "prospective" and HIDDEN.
 *  - No team members, contact details, dates, funding or awards are invented.
 */
import type {
  Article,
  ArticleCategory,
  Block,
  HomepageSectionRow,
  ImpactStatistic,
  MediaAsset,
  NavigationItem,
  Page,
  Partner,
  Programme,
  SiteSettings,
} from "../lib/types.ts";
import { ALL_PHOTOS, PHOTOS, ref } from "./photos.ts";
import { sid } from "./seed-id.ts";

export { sid };

const SEED_DATE = "2026-11-15T09:00:00.000Z";

/* ------------------------------------------------------------------ */
/* Site settings                                                       */
/* ------------------------------------------------------------------ */

export const seedSettings: SiteSettings = {
  org_name: "Alliance for Biodiversity and Conservation",
  short_name: "ABC",
  tagline: "Together for All Life.",
  description:
    "ABC is a proposed youth-led initiative connecting young people and communities with biodiversity through environmental learning, citizen science, research and conservation action.",
  logo: null,
  favicon_url: null,
  brand_colors: {
    forest: "#173D32",
    evergreen: "#245443",
    sage: "#A8B99B",
    ivory: "#F7F7F0",
    earth: "#795C43",
    charcoal: "#202923",
  },
  seo_title: "ABC | Alliance for Biodiversity and Conservation",
  seo_description:
    "ABC connects young people and communities with biodiversity through environmental learning, citizen science, research and meaningful conservation action. Together for All Life.",
  og_image: ref(PHOTOS.elephantsFamily),
  contact_email: "",
  contact_phone: "",
  address: "",
  location_note: "",
  social_links: [],
  footer_description:
    "A proposed youth-led initiative connecting young people and communities with biodiversity through learning, citizen science, research and conservation action.",
  copyright_text: "© {year} ABC — Alliance for Biodiversity and Conservation. All rights reserved.",
  newsletter_enabled: true,
  newsletter_heading: "Field notes, occasionally",
  newsletter_text:
    "Receive occasional updates on ABC's proposed Nature Labs, research and ways to take part. We only use your email address for these updates.",
  header_cta_label: "Get Involved",
  header_cta_href: "/get-involved",
  observations_open: false,
};

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

function nav(
  key: string,
  location: NavigationItem["location"],
  label: string,
  href: string,
  sort_order: number,
  parentKey: string | null = null,
): NavigationItem {
  return {
    id: sid(`nav:${key}`),
    location,
    label,
    href,
    parent_id: parentKey ? sid(`nav:${parentKey}`) : null,
    sort_order,
    is_visible: true,
    open_in_new_tab: false,
  };
}

export const seedNavigation: NavigationItem[] = [
  nav("h-about", "header", "About", "/about", 1),
  nav("h-work", "header", "Our Approach", "/our-approach", 2),
  nav("h-work-overview", "header", "Our approach", "/our-approach", 1, "h-work"),
  nav("h-work-labs", "header", "Nature Labs", "/nature-labs", 2, "h-work"),
  nav("h-prog-all", "header", "Our programmes", "/programmes", 3, "h-work"),
  nav("h-work-partners", "header", "Partners", "/partners", 4, "h-work"),
  nav("h-explore", "header", "Explore", "/explorer", 3),
  nav("h-explore-atlas", "header", "Biodiversity Explorer", "/explorer", 1, "h-explore"),
  nav("h-explore-cs", "header", "Citizen Science", "/citizen-science", 2, "h-explore"),
  nav("h-explore-research", "header", "Research & Insights", "/research", 3, "h-explore"),
  nav("h-stories", "header", "Stories & Media", "/stories", 4),
  nav("h-contact", "header", "Contact", "/contact", 5),

  nav("f-org", "footer", "Organisation", "", 1),
  nav("f-org-about", "footer", "About ABC", "/about", 1, "f-org"),
  nav("f-org-work", "footer", "Our Approach", "/our-approach", 2, "f-org"),
  nav("f-org-labs", "footer", "Nature Labs", "/nature-labs", 3, "f-org"),
  nav("f-org-programmes", "footer", "Our Programmes", "/programmes", 4, "f-org"),
  nav("f-org-partners", "footer", "Partners", "/partners", 5, "f-org"),
  nav("f-prog", "footer", "Explore", "", 2),
  nav("f-explore-atlas", "footer", "Biodiversity Explorer", "/explorer", 1, "f-prog"),
  nav("f-explore-cs", "footer", "Citizen Science", "/citizen-science", 2, "f-prog"),
  nav("f-explore-research", "footer", "Research & Insights", "/research", 3, "f-prog"),
  nav("f-org-stories", "footer", "Stories & Media", "/stories", 4, "f-prog"),
  nav("f-explore-notebook", "footer", "My field notebook", "/notebook", 5, "f-prog"),
  nav("f-take", "footer", "Take part", "", 3),
  nav("f-take-involved", "footer", "Get Involved", "/get-involved", 1, "f-take"),
  nav("f-take-apply", "footer", "Express interest", "/get-involved#apply", 2, "f-take"),
  nav("f-take-contact", "footer", "Contact", "/contact", 3, "f-take"),
  nav("f-info", "footer", "Information", "", 4),
  nav("f-info-privacy", "footer", "Privacy Policy", "/privacy", 1, "f-info"),
  nav("f-info-credits", "footer", "Image credits", "/credits", 2, "f-info"),
];

/* ------------------------------------------------------------------ */
/* Reusable content fragments                                          */
/* ------------------------------------------------------------------ */

const pathwayItems = [
  {
    icon: "book-open",
    title: "Learn",
    text: "Discover local species, habitats and the relationships that connect them.",
    activities: "Guided nature walks\nSpecies identification sessions\nLearning from local knowledge holders",
    leads_to: "Knowing what to look for makes careful observation possible.",
  },
  {
    icon: "binoculars",
    title: "Observe",
    text: "Watch, record and document nature carefully and consistently.",
    activities: "Repeated counts at the same site\nField notebooks and photographs\nShared recording methods",
    leads_to: "Patterns in what is recorded raise questions worth investigating.",
  },
  {
    icon: "search",
    title: "Investigate",
    text: "Ask questions and gather evidence through community-led research.",
    activities: "Choosing a question that matters locally\nPlanning a simple, sound method\nCollecting evidence with mentors",
    leads_to: "Evidence has to be interpreted before it can guide decisions.",
  },
  {
    icon: "lightbulb",
    title: "Understand",
    text: "Interpret findings and connect them to local realities and knowledge.",
    activities: "Discussing results together\nComparing findings with local knowledge\nBeing honest about what is still uncertain",
    leads_to: "Shared understanding shows where practical action would help most.",
  },
  {
    icon: "sprout",
    title: "Act",
    text: "Turn understanding into practical, community-owned conservation.",
    activities: "Habitat restoration\nAwareness activities\nChanges agreed and led by the community",
    leads_to: "What worked, and what did not, is worth telling others.",
  },
  {
    icon: "megaphone",
    title: "Share",
    text: "Communicate what we learn to inform and inspire others.",
    activities: "Community presentations\nWriting, photography and film\nPublishing results openly",
    leads_to: "Stories bring new people in, and the cycle begins again with learning.",
  },
];

const activityItems = [
  {
    icon: "sprout",
    title: "Nature Learning",
    text: "Hands-on environmental learning that helps children and young people recognise local species, habitats and ecological relationships.",
    image: null,
    link: { label: "Learn more", href: "/our-approach#nature-learning" },
  },
  {
    icon: "binoculars",
    title: "Citizen Science",
    text: "Structured observation and recording of birds, plants and insects, so that community members contribute data that supports conservation.",
    image: null,
    link: { label: "Learn more", href: "/our-approach#citizen-science" },
  },
  {
    icon: "microscope",
    title: "Community Research",
    text: "Locally led investigations into questions that matter to communities, supported by mentors and sound scientific methods.",
    image: null,
    link: { label: "Learn more", href: "/our-approach#community-research" },
  },
  {
    icon: "trees",
    title: "Conservation Action",
    text: "Practical, community-owned responses such as habitat restoration and awareness activities, guided by evidence.",
    image: null,
    link: { label: "Learn more", href: "/our-approach#conservation-action" },
  },
  {
    icon: "camera",
    title: "Conservation Storytelling",
    text: "Sharing what we learn through writing, photography and film to inspire wider care for biodiversity.",
    image: null,
    link: { label: "Learn more", href: "/our-approach#conservation-storytelling" },
  },
];

const pilotNote = "Proposed targets for the six-month pilot. These are not achieved results.";

function block(key: string, type: Block["type"], data: Record<string, unknown>, visible = true): Block {
  return { id: sid(`block:${key}`), type, visible, data: { anchor: "", ...data } };
}

/* ------------------------------------------------------------------ */
/* Homepage                                                            */
/* ------------------------------------------------------------------ */

export const seedHomepage: Block[] = [
  block("home-hero", "hero", {
    eyebrow: "Alliance for Biodiversity and Conservation",
    headline: "Together for All Life.",
    text: "We connect young people and communities with biodiversity through environmental learning, citizen science, research and meaningful conservation action.",
    primary: { label: "Explore the living atlas", href: "/explorer" },
    secondary: { label: "Get Involved", href: "/get-involved" },
    experience: "3d",
    theme: "auto",
    sound: true,
    chapters: [
      {
        title: "Discover.",
        text: "Every landscape is full of life. Learning to notice it is where conservation begins.",
      },
      {
        title: "Understand.",
        text: "Careful observation, shared between young people and communities, becomes knowledge.",
      },
      {
        title: "Protect.",
        text: "Understanding leads to action that communities choose, own and sustain.",
      },
    ],
    hotspots: [
      {
        title: "Forest canopy",
        text: "Mountain forests catch rain and mist and release water slowly to everything downstream.",
        zone: "canopy",
        link: { label: "Montane rainforest", href: "/explorer#montane-rainforest" },
      },
      {
        title: "Hills and farmland",
        text: "Most everyday biodiversity lives close to home: in fields, gardens and school grounds.",
        zone: "hills",
        link: { label: "Hills and farmland", href: "/explorer#hills-and-farmland" },
      },
      {
        title: "Wetland",
        text: "Marshes store and clean water, and shelter cranes, kingfishers and many other species.",
        zone: "wetland",
        link: { label: "Wetlands and marshes", href: "/explorer#wetlands-and-marshes" },
      },
      {
        title: "Open water",
        text: "Lakes and rivers connect every habitat in the landscape.",
        zone: "water",
        link: { label: "Explore the atlas", href: "/explorer" },
      },
    ],
    mode: "slideshow",
    interval: 8,
    slides: [
      { image: ref(PHOTOS.elephantsFamily), visible: true },
      { image: ref(PHOTOS.crane), visible: true },
      { image: ref(PHOTOS.rugezi), visible: true },
      { image: ref(PHOTOS.gorilla), visible: true },
      { image: ref(PHOTOS.youthPlanting), visible: true },
    ],
  }),
  block("home-intro", "image_text", {
    eyebrow: "Who we are",
    heading: "Conservation Begins With Understanding.",
    body: `<p>Biodiversity is protected most effectively by the people who live alongside it. ABC, the Alliance for Biodiversity and Conservation, is a proposed youth-led initiative that helps young people and communities discover the species and ecosystems around them, study them with care, and act on what they learn.</p><p>Curiosity becomes commitment when people can observe nature first-hand, record what they see and contribute to real ecological knowledge. Our approach links environmental learning with citizen science, community research and practical conservation, so that understanding leads directly to action.</p>`,
    image: ref(PHOTOS.craneWetland),
    image_position: "left",
    variant: "light",
    badge: "",
    link: { label: "About ABC", href: "/about" },
  }),
  block("home-atlas", "atlas", {
    eyebrow: "The living atlas",
    heading: "Cross a country in a single line",
    intro:
      "From the shore of Lake Kivu, over mountain rainforest and cultivated hills, through valley wetlands to the eastern savanna. Choose a habitat to see how it works and who lives there.",
    note: "Educational reference information. These are not ABC field observations.",
    link: { label: "Open the Biodiversity Explorer", href: "/explorer" },
  }),
  block("home-approach", "cards", {
    eyebrow: "Our approach",
    heading: "Five interconnected activities",
    intro:
      "Each activity strengthens the others, moving people from their first encounters with nature towards lasting stewardship.",
    layout: "icon",
    columns: "5",
    background: "white",
    items: activityItems,
  }),
  block("home-pathway", "steps", {
    eyebrow: "Research to action",
    heading: "From curiosity to conservation",
    intro:
      "A simple pathway guides every ABC activity, so that what people learn becomes knowledge they can use, act on and share. Choose a stage to see what happens there.",
    background: "forest",
    style: "pathway",
    items: pathwayItems,
  }),
  block("home-labs", "image_text", {
    eyebrow: "Community Nature Labs",
    heading: "Learning From the Natural World Around Us.",
    body: `<p>ABC proposes to establish Community Nature Learning and Citizen Science Labs: welcoming, practical spaces where children, young people and community members learn about biodiversity, take part in structured observation and contribute to local research.</p><p>The first phase is a proposed six-month pilot at two sites in Rwanda. It is designed to test the Nature Lab model, learn from participants and build the evidence needed to grow responsibly.</p>`,
    image: ref(PHOTOS.nyungweSunrise),
    image_position: "right",
    variant: "feature",
    badge: "Proposed six-month pilot · Two sites in Rwanda",
    link: { label: "Discover Nature Labs", href: "/nature-labs" },
  }),
  block("home-programmes", "programmes", {
    eyebrow: "Programme areas",
    heading: "Building a long-term movement",
    intro:
      "Five proposed programme areas set out how ABC intends to grow beyond the pilot. They are long-term ambitions that will be developed in stages.",
    featured_only: false,
    link: { label: "View all programmes", href: "/programmes" },
  }),
  block("home-impact", "statistics", {
    eyebrow: "Six-month pilot targets",
    heading: "What the proposed pilot aims to achieve",
    intro:
      "These figures are proposed targets for ABC's initial six-month Rwanda pilot. They will be replaced with verified outcomes as the work progresses.",
    note: pilotNote,
    status_filter: "all",
    show_legend: true,
  }),
  block("home-milestones", "milestones", {
    eyebrow: "Planned stages",
    heading: "How the proposed pilot would unfold",
    intro: "",
    note: "These stages are planned. Each will be marked as in progress or done only when that is true.",
  }),
  block("home-stories", "stories", {
    eyebrow: "Stories & insights",
    heading: "Notes from the natural world",
    intro: "Updates, explainers and perspectives on biodiversity, young people and community conservation.",
    count: 3,
    featured_only: false,
    link: { label: "All stories", href: "/stories" },
  }),
  block("home-partners", "partners", {
    eyebrow: "Working together",
    heading: "Partners and collaboration",
    intro: "Organisations that have formally partnered with ABC.",
    relationship: "confirmed",
    note: "",
    empty_text:
      "ABC is at the proposal stage and has no confirmed partners yet. We would welcome conversations with schools, research institutions, conservation organisations and funders who share this aim.",
    link: { label: "Explore collaboration", href: "/partners" },
  }),
  block("home-involved", "cards", {
    eyebrow: "Get involved",
    heading: "There is a place for you in this work",
    intro:
      "Whether you are a young person curious about nature, a researcher, an educator or an organisation, we would welcome your interest.",
    layout: "image",
    columns: "5",
    background: "ivory",
    items: [
      {
        icon: "hand-heart",
        title: "Volunteer",
        text: "Offer your time and skills to help prepare and run nature learning activities.",
        image: ref(PHOTOS.youthGroup),
        link: { label: "Volunteer", href: "/get-involved#apply" },
      },
      {
        icon: "binoculars",
        title: "Become a youth researcher",
        text: "Learn field methods, record biodiversity and investigate questions that matter locally.",
        image: ref(PHOTOS.akagera),
        link: { label: "Express interest", href: "/get-involved#apply" },
      },
      {
        icon: "handshake",
        title: "Partner with ABC",
        text: "Explore an institutional partnership to strengthen youth-led conservation.",
        image: ref(PHOTOS.communityKivu),
        link: { label: "Start a conversation", href: "/contact" },
      },
      {
        icon: "sprout",
        title: "Support community Nature Labs",
        text: "Help bring the proposed Nature Lab pilot to life in two Rwandan communities.",
        image: ref(PHOTOS.youthPlanting),
        link: { label: "Find out how", href: "/nature-labs" },
      },
      {
        icon: "microscope",
        title: "Collaborate on research",
        text: "Work with young researchers and communities on ecological questions.",
        image: ref(PHOTOS.rugezi),
        link: { label: "Collaborate", href: "/get-involved#apply" },
      },
    ],
  }),
  block("home-cta", "cta", {
    eyebrow: "Together for All Life",
    heading: "Help shape ABC from the beginning",
    text: "ABC is at an early stage. If you share our commitment to biodiversity and to young people, we would welcome a conversation.",
    primary: { label: "Contact us", href: "/contact" },
    secondary: { label: "Get involved", href: "/get-involved" },
    image: ref(PHOTOS.lakeKivu),
  }),
];

export const seedHomepageRows: HomepageSectionRow[] = seedHomepage.map((b, i) => ({
  id: b.id,
  type: b.type,
  content: b.data,
  is_visible: b.visible,
  sort_order: i + 1,
}));

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

function page(p: Omit<Page, "id" | "status" | "seo_title" | "seo_description"> & Partial<Page>): Page {
  return {
    status: "published",
    seo_title: "",
    seo_description: "",
    ...p,
    id: p.id ?? sid(`page:${p.slug}`),
  };
}

const ctaInvolved = (key: string) =>
  block(key, "cta", {
    eyebrow: "Get involved",
    heading: "Join us in protecting all life",
    text: "Volunteer, become a youth researcher, collaborate on research or explore a partnership with ABC.",
    primary: { label: "Get involved", href: "/get-involved" },
    secondary: { label: "Contact us", href: "/contact" },
    image: ref(PHOTOS.youthGroup),
  });

export const seedPages: Page[] = [
  page({
    slug: "about",
    title: "About ABC",
    hero_eyebrow: "Alliance for Biodiversity and Conservation",
    description:
      "A proposed youth-led initiative connecting young people and communities with the biodiversity around them.",
    hero_image: ref(PHOTOS.nyungweForest),
    is_system: true,
    sections: [
      block("about-who", "rich_text", {
        eyebrow: "Who we are",
        heading: "A youth-led alliance for all life",
        body: `<p>ABC, the Alliance for Biodiversity and Conservation, is a proposed youth-led initiative dedicated to connecting young people and communities with the biodiversity around them.</p><p>We bring together environmental learning, citizen science, community research and conservation action, so that the people who live closest to nature are equipped to understand it, study it and protect it.</p><p>ABC is in its early stages. Our first proposed step is a six-month pilot of Community Nature Learning and Citizen Science Labs at two sites in Rwanda.</p>`,
        width: "narrow",
        background: "ivory",
      }),
      block("about-purpose", "statement", {
        eyebrow: "Our purpose",
        text: "Empowering young people and communities through environmental learning, citizen science, research and collective action to protect biodiversity and sustain healthy ecosystems.",
        attribution: "",
        background: "forest",
      }),
      block("about-vision-mission", "cards", {
        eyebrow: "Vision and mission",
        heading: "Where we are heading",
        intro: "",
        layout: "icon",
        columns: "2",
        background: "white",
        items: [
          {
            icon: "eye",
            title: "Our vision",
            text: "A world where young people and communities actively contribute to a thriving, biodiverse planet.",
            image: null,
            link: { label: "", href: "" },
          },
          {
            icon: "compass",
            title: "Our mission",
            text: "To connect, equip and mobilise young people and communities to understand biodiversity, generate ecological knowledge and take meaningful conservation action.",
            image: null,
            link: { label: "", href: "" },
          },
        ],
      }),
      block("about-story", "image_text", {
        eyebrow: "Our story",
        heading: "Starting with understanding",
        body: `<p>ABC begins from a simple observation: many young people grow up surrounded by remarkable biodiversity, yet have few opportunities to explore it, study it or take part in decisions about its future.</p><p>The initiative proposes to change that by creating practical spaces for learning and discovery, linking participants with mentors and researchers, and supporting community-led conservation. Rather than starting large, ABC intends to begin with a carefully designed pilot, learn from it and grow responsibly.</p><p>We look forward to writing the next chapters together with the communities, young people and institutions who join us.</p>`,
        image: ref(PHOTOS.youthPlanting),
        image_position: "right",
        variant: "light",
        badge: "",
        link: { label: "", href: "" },
      }),
      block("about-values", "cards", {
        eyebrow: "Core values",
        heading: "What guides us",
        intro: "Seven values shape how ABC works with young people, communities and partners.",
        layout: "icon",
        columns: "4",
        background: "sage",
        items: [
          { icon: "leaf", title: "Biodiversity", text: "We value every form of life and the ecosystems that sustain them." },
          { icon: "users", title: "Community ownership", text: "Communities lead, shape and own conservation work in their places." },
          { icon: "sprout", title: "Youth leadership", text: "Young people are leaders and decision-makers today, not only in the future." },
          { icon: "microscope", title: "Scientific curiosity", text: "We ask questions, gather evidence and learn from what we find." },
          { icon: "handshake", title: "Collaboration", text: "We achieve more by working with others across disciplines and sectors." },
          { icon: "target", title: "Action", text: "Knowledge should lead to practical and meaningful conservation outcomes." },
          { icon: "heart-handshake", title: "Inclusion", text: "Everyone belongs in the work of protecting nature, whatever their background." },
        ].map((v) => ({ ...v, image: null, link: { label: "", href: "" } })),
      }),
      block("about-approach", "steps", {
        eyebrow: "Our approach",
        heading: "Learn, observe, investigate, understand, act, share",
        intro: "Our approach turns curiosity into evidence and evidence into community-led action.",
        background: "white",
        items: pathwayItems,
      }),
      block("about-team", "team", {
        eyebrow: "People",
        heading: "Our team",
        intro: "The people building ABC.",
      }),
      ctaInvolved("about-cta"),
    ],
  }),
  page({
    id: sid("page:our-work"),
    slug: "our-approach",
    title: "Our Approach",
    hero_eyebrow: "What we do",
    description: "Five interconnected activities that move people from learning about nature to lasting conservation action.",
    hero_image: ref(PHOTOS.akagera),
    is_system: true,
    sections: [
      block("work-intro", "rich_text", {
        eyebrow: "An integrated approach",
        heading: "Five activities, one pathway",
        body: `<p>ABC's work is organised around five interconnected activities. Together they form a pathway that begins with curiosity and leads to communities generating knowledge and leading conservation in their own places.</p><p>The activities described here set out how ABC intends to work. They will be introduced first through the proposed six-month Rwanda pilot and refined based on what we learn.</p>`,
        width: "narrow",
        background: "ivory",
      }),
      block("work-learning", "image_text", {
        anchor: "nature-learning",
        eyebrow: "01 · Nature Learning",
        heading: "Discovering the living world nearby",
        body: `<p>Nature Learning introduces children, young people and community members to the biodiversity around them. Through guided walks, species identification, habitat exploration and practical activities, participants build the knowledge and confidence to notice and value nature.</p><ul><li>Outdoor, hands-on and age-appropriate learning</li><li>A focus on locally relevant species and ecosystems</li><li>Respect for local and indigenous knowledge</li></ul>`,
        image: ref(PHOTOS.youthGroup),
        image_position: "right",
        variant: "light",
        badge: "",
        link: { label: "", href: "" },
      }),
      block("work-citizen", "image_text", {
        anchor: "citizen-science",
        eyebrow: "02 · Citizen Science",
        heading: "Everyone can contribute to knowledge",
        body: `<p>Citizen science invites participants to observe and record nature systematically, from bird counts to plant and insect surveys. Using simple, consistent methods, community members can generate records that help track change and inform conservation.</p><ul><li>Structured observation and recording</li><li>Training in identification and data quality</li><li>Sharing records with wider biodiversity databases where appropriate</li></ul>`,
        image: ref(PHOTOS.crane),
        image_position: "left",
        variant: "sage",
        badge: "",
        link: { label: "", href: "" },
      }),
      block("work-research", "image_text", {
        anchor: "community-research",
        eyebrow: "03 · Community Research",
        heading: "Questions that matter locally",
        body: `<p>Community Research supports young people and community members to design and carry out investigations into questions that matter to them, such as how a wetland is changing or which species depend on a local forest.</p><ul><li>Locally defined research questions</li><li>Mentoring from experienced researchers</li><li>Ethical, rigorous and practical methods</li></ul>`,
        image: ref(PHOTOS.rugezi),
        image_position: "right",
        variant: "light",
        badge: "",
        link: { label: "", href: "" },
      }),
      block("work-action", "image_text", {
        anchor: "conservation-action",
        eyebrow: "04 · Conservation Action",
        heading: "From evidence to stewardship",
        body: `<p>Conservation Action turns understanding into practical responses that communities own and sustain, such as habitat restoration, native tree planting, awareness activities and dialogue with local decision-makers.</p><ul><li>Actions guided by evidence gathered locally</li><li>Community ownership and long-term care</li><li>Collaboration with conservation authorities and organisations</li></ul>`,
        image: ref(PHOTOS.communityKivu),
        image_position: "left",
        variant: "sage",
        badge: "",
        link: { label: "", href: "" },
      }),
      block("work-story", "image_text", {
        anchor: "conservation-storytelling",
        eyebrow: "05 · Conservation Storytelling",
        heading: "Sharing what we learn",
        body: `<p>Conservation Storytelling helps participants communicate their discoveries through writing, photography, film and community events. Stories carry knowledge beyond the field, inspire others and give young people a voice in conservation.</p><ul><li>Photography, writing and short film</li><li>Community exhibitions and presentations</li><li>Stories published on this website</li></ul>`,
        image: ref(PHOTOS.gorilla),
        image_position: "right",
        variant: "light",
        badge: "",
        link: { label: "Read our stories", href: "/stories" },
      }),
      block("work-pathway", "steps", {
        anchor: "research-to-action",
        eyebrow: "Research to action",
        heading: "How the activities connect",
        intro: "Every activity contributes to a single pathway from learning to sharing.",
        background: "white",
        items: pathwayItems,
      }),
      ctaInvolved("work-cta"),
    ],
  }),
  page({
    slug: "nature-labs",
    title: "Nature Labs",
    hero_eyebrow: "Community Nature Learning and Citizen Science Labs",
    description: "A proposed model for community-based places of discovery, learning and research, beginning with a six-month pilot in Rwanda.",
    hero_image: ref(PHOTOS.wetlandPlanting),
    is_system: true,
    sections: [
      block("labs-what", "image_text", {
        eyebrow: "What is a Nature Lab?",
        heading: "A place to learn from the natural world",
        body: `<p>A Community Nature Learning and Citizen Science Lab, or Nature Lab, is a proposed community-based space where children, young people and community members come together to explore biodiversity, learn practical field skills and contribute to research.</p><p>A Nature Lab is less a building than a way of working: a local base, a nearby natural site, simple equipment, trained facilitators and a programme of regular activities shaped by the community.</p>`,
        image: ref(PHOTOS.youthPlanting),
        image_position: "right",
        variant: "light",
        badge: "Proposed model",
        link: { label: "", href: "" },
      }),
      block("labs-how", "steps", {
        eyebrow: "How the model works",
        heading: "A cycle of learning and action",
        intro: "Each proposed Nature Lab would follow a simple cycle that communities can adapt to their own setting.",
        background: "white",
        items: [
          { icon: "users", title: "Engage", text: "Work with local leaders, schools and residents to agree on goals and a suitable site." },
          { icon: "book-open", title: "Learn", text: "Run regular nature learning sessions for children and young people." },
          { icon: "binoculars", title: "Observe", text: "Introduce structured citizen science recording of local species." },
          { icon: "microscope", title: "Investigate", text: "Support youth researchers to carry out small community research projects." },
          { icon: "sprout", title: "Act", text: "Plan practical conservation responses with the community." },
          { icon: "megaphone", title: "Share", text: "Present findings to the community and share stories more widely." },
        ],
      }),
      block("labs-participation", "cards", {
        eyebrow: "Community participation",
        heading: "Built with and for communities",
        intro: "Nature Labs are designed to be shaped and owned by the people who take part in them.",
        layout: "icon",
        columns: "3",
        background: "ivory",
        items: [
          { icon: "sprout", title: "Children and young people", text: "The heart of each Nature Lab, taking part in learning, observation and storytelling." },
          { icon: "binoculars", title: "Youth researchers", text: "Older young people trained to lead observations and community research." },
          { icon: "school", title: "Teachers and educators", text: "Partners in connecting Nature Lab activities with classroom learning." },
          { icon: "users", title: "Community members", text: "Residents who help shape priorities, share knowledge and take part in action." },
          { icon: "feather", title: "Local knowledge holders", text: "Elders and practitioners whose knowledge of the land enriches every activity." },
          { icon: "graduation-cap", title: "Researchers and mentors", text: "Scientists and practitioners who offer guidance and help ensure rigour." },
        ].map((v) => ({ ...v, image: null, link: { label: "", href: "" } })),
      }),
      block("labs-themes", "cards", {
        eyebrow: "Potential research themes",
        heading: "Questions we could explore together",
        intro: "Research themes will be agreed with each community. These are examples of potential areas of focus.",
        layout: "numbered",
        columns: "3",
        background: "white",
        items: [
          { icon: "bird", title: "Birds and seasonal change", text: "Recording local bird diversity, including wetland species such as the Grey Crowned Crane." },
          { icon: "droplets", title: "Wetland health", text: "Observing water, vegetation and wildlife to understand how wetlands are changing." },
          { icon: "bug", title: "Pollinators and insects", text: "Surveying insects that support local farming and ecosystems." },
          { icon: "trees", title: "Native plants and restoration", text: "Identifying native species and monitoring restoration efforts." },
          { icon: "footprints", title: "People and wildlife", text: "Understanding relationships between communities and the wildlife around them." },
          { icon: "sun", title: "Climate and local ecosystems", text: "Documenting local observations of seasonal and environmental change." },
        ].map((v) => ({ ...v, image: null, link: { label: "", href: "" } })),
      }),
      block("labs-pilot", "image_text", {
        anchor: "rwanda-pilot",
        eyebrow: "The Rwanda pilot",
        heading: "Starting small, learning carefully",
        body: `<p>ABC proposes a six-month pilot at two sites in Rwanda to test the Nature Lab model in practice. The pilot aims to engage children and young people in nature learning, train a group of youth researchers and support two community research projects.</p><p>The pilot sites have not yet been established. Their selection, design and activities will be developed together with communities and relevant institutions. Results will be shared openly on this website as the work progresses.</p>`,
        image: ref(PHOTOS.lakeKivu),
        image_position: "left",
        variant: "feature",
        badge: "Proposed · Six months · Two sites",
        link: { label: "Collaborate on the pilot", href: "/get-involved#apply" },
      }),
      block("labs-sites", "nature_labs", {
        anchor: "sites",
        eyebrow: "Nature Lab sites",
        heading: "Where Nature Labs are",
        intro: "",
        empty_text:
          "No Nature Labs have been established yet. The two proposed pilot sites will be chosen together with communities, and will appear here once they are agreed.",
      }),
      block("labs-start", "cards", {
        anchor: "start",
        eyebrow: "Taking part",
        heading: "How a community could host or join a Nature Lab",
        intro: "A Nature Lab does not need a permanent building. It needs people, a place to meet and somewhere nearby to observe nature.",
        layout: "numbered",
        columns: "4",
        background: "white",
        items: [
          { title: "Start a conversation", text: "A school, youth group or community tells ABC about its interest and its local setting." },
          { title: "Choose a place", text: "Together we identify a meeting place and a nearby natural site: a wetland edge, a woodland or a school garden." },
          { title: "Agree priorities", text: "Community members decide what they most want to learn about and protect." },
          { title: "Begin regular sessions", text: "Trained facilitators and young researchers start learning and recording activities." },
        ].map((v) => ({ ...v, icon: "leaf", image: null, link: { label: "", href: "" } })),
      }),
      block("labs-targets", "statistics", {
        eyebrow: "Pilot targets",
        heading: "What the proposed pilot aims to achieve",
        intro: "Targets for the proposed six-month pilot. They will be updated with verified results.",
        note: pilotNote,
        status_filter: "all",
      }),
      block("labs-faq", "faq", {
        eyebrow: "Questions",
        heading: "About the Nature Labs",
        items: [
          {
            question: "Are the Nature Labs already operating?",
            answer:
              "Not yet. The Nature Labs are a proposed model. ABC plans to begin with a six-month pilot at two sites in Rwanda, and we will share progress here as it happens.",
          },
          {
            question: "Where will the pilot sites be?",
            answer:
              "The two pilot sites will be selected together with communities and relevant institutions in Rwanda. We will publish details once sites are confirmed.",
          },
          {
            question: "How can my organisation collaborate?",
            answer:
              "We would welcome conversations with schools, community groups, researchers and conservation organisations. Please use the form on our Get Involved page or contact us directly.",
          },
        ],
      }),
      block("labs-cta", "cta", {
        eyebrow: "How to collaborate",
        heading: "Help bring Nature Labs to life",
        text: "We are looking for communities, educators, researchers and organisations who would like to help shape the pilot.",
        primary: { label: "Express interest", href: "/get-involved#apply" },
        secondary: { label: "Contact us", href: "/contact" },
        image: ref(PHOTOS.akagera),
      }),
    ],
  }),
  page({
    slug: "programmes",
    title: "Programmes",
    hero_eyebrow: "Programme areas",
    description: "Five proposed long-term programme areas that describe how ABC intends to grow.",
    hero_image: ref(PHOTOS.elephantsChobe),
    is_system: true,
    sections: [
      block("prog-intro", "rich_text", {
        eyebrow: "Our ambitions",
        heading: "A long-term framework",
        body: `<p>ABC's programme areas describe how the initiative intends to grow over time. They are proposed, long-term areas of work rather than fully operational programmes, and will be developed in stages, beginning with the Rwanda Nature Lab pilot.</p>`,
        width: "narrow",
        background: "ivory",
      }),
      block("prog-list", "programmes", {
        eyebrow: "",
        heading: "Programme areas",
        intro: "",
        featured_only: false,
        link: { label: "", href: "" },
      }),
      ctaInvolved("prog-cta"),
    ],
  }),
  page({
    slug: "stories",
    title: "Stories & Media",
    hero_eyebrow: "Stories, research and field notes",
    description: "Articles, research updates, field notes, photo stories and community perspectives from ABC.",
    hero_image: ref(PHOTOS.crane),
    is_system: true,
    sections: [],
  }),
  page({
    slug: "explorer",
    title: "The Living Atlas",
    hero_eyebrow: "Biodiversity Explorer",
    description: "Travel across Rwanda's landscapes, from lake shore to savanna, and meet some of the species that live there.",
    hero_image: ref(PHOTOS.turaco),
    is_system: true,
    sections: [
      block("explorer-atlas", "atlas", {
        eyebrow: "Five habitats, one transect",
        heading: "Choose a habitat",
        intro: "The line below runs west to east across Rwanda. Each habitat sits at its own height and does its own work in the landscape.",
        note: "Educational reference information. These are not ABC field observations.",
        link: { label: "", href: "" },
      }),
      block("explorer-species", "species", {
        anchor: "species",
        eyebrow: "Nature explorer",
        heading: "Meet the species",
        intro: "Search by name, or filter by group and habitat. Save entries to your field notebook to build your own guide.",
        mode: "all",
        count: 12,
        link: { label: "", href: "" },
      }),
      block("explorer-about", "rich_text", {
        eyebrow: "About this information",
        heading: "Reference entries and field observations",
        body: "<p>Everything in the explorer today is <strong>educational reference information</strong>, written to help people learn about species and habitats. The photographs are openly licensed images chosen to illustrate each entry; their captions say where they were taken.</p><p>ABC has not yet begun fieldwork. When participants in the proposed Nature Labs start recording wildlife, entries based on their records will be clearly marked as <strong>ABC field observations</strong>, and precise locations of sensitive species will never be published.</p><p>Conservation statuses follow the IUCN Red List and can change. Please check the Red List for the current assessment.</p>",
        width: "narrow",
        background: "white",
      }),
      ctaInvolved("explorer-cta"),
    ],
  }),
  page({
    slug: "citizen-science",
    title: "Citizen Science",
    hero_eyebrow: "The citizen science observatory",
    description: "How young people and communities can observe nature carefully, record what they see and turn it into knowledge.",
    hero_image: ref(PHOTOS.akagera),
    is_system: true,
    sections: [
      block("cs-what", "image_text", {
        eyebrow: "What is citizen science?",
        heading: "Science that anyone can take part in",
        body: "<p>Citizen science is research carried out with the public. People observe the natural world around them, record what they find in a consistent way and share it, so that many small observations add up to something no single researcher could collect alone.</p><p>For ABC, it is also a way of learning. Looking closely at a bird, a plant or an insect, week after week, builds the attention and care that conservation depends on.</p>",
        image: ref(PHOTOS.kingfisher),
        image_position: "right",
        variant: "light",
        badge: "",
        link: { label: "", href: "" },
      }),
      block("cs-how", "steps", {
        eyebrow: "From a sighting to a record",
        heading: "How an observation becomes knowledge",
        intro: "",
        background: "white",
        style: "timeline",
        items: [
          { icon: "eye", title: "Notice", text: "See or hear something, and take time to look properly." },
          { icon: "notebook-pen", title: "Record", text: "Write down what, when and roughly where, in the same way each time." },
          { icon: "search", title: "Check", text: "Confirm the identification with others before it is kept." },
          { icon: "users", title: "Share", text: "Add it to the community's shared record, with consent." },
          { icon: "lightbulb", title: "Use", text: "Look for patterns and decide together what they mean." },
        ].map((v) => ({ ...v, activities: "", leads_to: "" })),
      }),
      block("cs-projects", "projects", {
        anchor: "projects",
        eyebrow: "Proposed activities",
        heading: "What communities could record",
        intro: "These activities are proposed for the pilot Nature Labs. None has started yet.",
        kind: "citizen_science",
        empty_text: "No citizen science activities have been published yet.",
      }),
      block("cs-observations", "observations", {
        anchor: "observations",
        eyebrow: "Community observations",
        heading: "Share what you have seen",
        intro: "Observations are reviewed by ABC before they appear here. We only ask for a general area, never a precise location.",
        closed_text:
          "Observation submissions are not open yet. They will open once the proposed Nature Labs begin and a team is in place to review each record. Until then, no observations are being collected or displayed.",
      }),
      block("cs-faq", "faq", {
        eyebrow: "Privacy and care",
        heading: "How observations will be handled",
        items: [
          {
            question: "Will my observation be published straight away?",
            answer: "No. Every observation is reviewed by ABC first. Only approved observations, submitted with consent, are shown publicly.",
          },
          {
            question: "Do you publish where sensitive species were seen?",
            answer: "No. We ask only for a general area such as a district, and we do not collect or publish precise locations.",
          },
          {
            question: "Will my name appear?",
            answer: "Only if you ask to be credited. Contact details are never published, and the names of people under 18 are never shown.",
          },
          {
            question: "Can children take part?",
            answer: "Children are welcome to take part with a parent, guardian or teacher, who should submit the observation on their behalf.",
          },
        ],
      }),
      ctaInvolved("cs-cta"),
    ],
  }),
  page({
    slug: "research",
    title: "Research & Insights",
    hero_eyebrow: "Community research",
    description: "Locally led investigations into the questions that matter to communities, and what is learned from them.",
    hero_image: ref(PHOTOS.rugezi),
    is_system: true,
    sections: [
      block("research-intro", "rich_text", {
        eyebrow: "How ABC intends to do research",
        heading: "Questions that begin in the community",
        body: "<p>ABC's proposed research is small in scale and practical in purpose. Young researchers, supported by mentors, investigate questions that their own communities want answered: about a wetland, a forest edge, a species people value or a change they have noticed.</p><p>The proposed six-month pilot aims to support two community research projects. They have not been chosen yet, because the questions belong to the communities who will take part.</p>",
        width: "narrow",
        background: "ivory",
      }),
      block("research-principles", "cards", {
        eyebrow: "Principles",
        heading: "What good community research needs",
        intro: "",
        layout: "numbered",
        columns: "4",
        background: "white",
        items: [
          { title: "Community questions first", text: "Research starts from what people living in a place want to understand." },
          { title: "Sound methods", text: "Simple, repeatable methods, checked by mentors, so that results can be trusted." },
          { title: "Consent and respect", text: "Local knowledge is recorded only with agreement, and credited to those who share it." },
          { title: "Open sharing", text: "Findings go back to the community first, then are published openly." },
        ].map((v) => ({ ...v, icon: "leaf", image: null, link: { label: "", href: "" } })),
      }),
      block("research-projects", "projects", {
        anchor: "projects",
        eyebrow: "Research projects",
        heading: "Current and completed research",
        intro: "",
        kind: "research",
        empty_text:
          "No research projects have begun. When the proposed pilot starts, each project will be listed here with its question, method, status and findings.",
      }),
      block("research-stories", "stories", {
        eyebrow: "Insights",
        heading: "Reading on research and citizen science",
        intro: "",
        count: 3,
        featured_only: false,
        link: { label: "All stories", href: "/stories" },
      }),
      ctaInvolved("research-cta"),
    ],
  }),
  page({
    slug: "partners",
    title: "Partners & Collaboration",
    hero_eyebrow: "Working together",
    description: "ABC is at the proposal stage. This page sets out who we hope to work with, and will list partners once partnerships are confirmed.",
    hero_image: ref(PHOTOS.communityKivu),
    is_system: true,
    sections: [
      block("partners-intro", "rich_text", {
        eyebrow: "Where things stand",
        heading: "No confirmed partnerships yet",
        body: "<p>ABC is a proposed initiative and has not yet formed any formal partnerships. We think it is important to say so plainly.</p><p>Organisations will be named on this page only once a relationship has been agreed and they have given permission. Until then, we describe the kinds of collaboration we are looking for.</p>",
        width: "narrow",
        background: "ivory",
      }),
      block("partners-confirmed", "partners", {
        eyebrow: "Confirmed partners",
        heading: "Our partners",
        intro: "",
        relationship: "confirmed",
        note: "",
        empty_text: "",
        link: { label: "", href: "" },
      }),
      block("partners-ways", "cards", {
        eyebrow: "Ways to collaborate",
        heading: "Who we hope to work with",
        intro: "",
        layout: "icon",
        columns: "4",
        background: "white",
        items: [
          { icon: "school", title: "Schools and educators", text: "Linking Nature Lab activities with classroom learning." },
          { icon: "microscope", title: "Research institutions", text: "Mentoring young researchers and helping to keep methods sound." },
          { icon: "trees", title: "Conservation organisations", text: "Sharing experience, sites and practical guidance." },
          { icon: "hand-heart", title: "Funders and supporters", text: "Helping to bring the proposed pilot to life." },
        ].map((v) => ({ ...v, image: null, link: { label: "", href: "" } })),
      }),
      block("partners-cta", "cta", {
        eyebrow: "Start a conversation",
        heading: "Interested in working with ABC?",
        text: "Tell us about your organisation and what you have in mind.",
        primary: { label: "Contact us", href: "/contact" },
        secondary: { label: "Get involved", href: "/get-involved" },
        image: ref(PHOTOS.wetlandPlanting),
      }),
    ],
  }),
  page({
    slug: "get-involved",
    title: "Get Involved",
    hero_eyebrow: "Take part",
    description: "Join ABC as a volunteer, youth researcher, research collaborator or institutional partner.",
    hero_image: ref(PHOTOS.youthGroup),
    is_system: true,
    sections: [
      block("involve-ways", "cards", {
        eyebrow: "Ways to take part",
        heading: "Find your place in ABC",
        intro: "ABC is preparing its first proposed pilot. Expressions of interest help us plan and build the right team.",
        layout: "icon",
        columns: "3",
        background: "ivory",
        items: [
          {
            icon: "hand-heart",
            title: "Volunteer opportunities",
            text: "Support nature learning sessions, events, logistics, photography or communications.",
            image: null,
            link: { label: "Apply to volunteer", href: "#apply" },
          },
          {
            icon: "sprout",
            title: "Youth participation",
            text: "Young people can take part in learning activities or train as youth researchers.",
            image: null,
            link: { label: "Express interest", href: "#apply" },
          },
          {
            icon: "microscope",
            title: "Research collaboration",
            text: "Researchers and students can co-design community research and mentor young people.",
            image: null,
            link: { label: "Collaborate", href: "#apply" },
          },
          {
            icon: "handshake",
            title: "Institutional partnerships",
            text: "Organisations can explore partnerships that strengthen youth-led conservation.",
            image: null,
            link: { label: "Start a conversation", href: "/contact" },
          },
          {
            icon: "users",
            title: "Community engagement",
            text: "Community groups can help shape where and how Nature Labs could work.",
            image: null,
            link: { label: "Get in touch", href: "#apply" },
          },
          {
            icon: "megaphone",
            title: "Share the story",
            text: "Help more people learn about ABC by sharing our stories and updates.",
            image: null,
            link: { label: "Read stories", href: "/stories" },
          },
        ],
      }),
      block("involve-form", "form", {
        anchor: "apply",
        eyebrow: "Express your interest",
        heading: "Tell us how you would like to be involved",
        intro:
          "We read every submission. ABC is at an early stage, so we will contact you as suitable opportunities become available.",
        form: "volunteer",
        image: ref(PHOTOS.youthPlanting),
      }),
      block("involve-faq", "faq", {
        eyebrow: "Questions",
        heading: "Before you apply",
        items: [
          {
            question: "Is ABC recruiting right now?",
            answer:
              "ABC is preparing a proposed pilot. Expressions of interest help us plan; we will contact you when suitable opportunities open.",
          },
          {
            question: "Do I need scientific experience?",
            answer: "No. Curiosity and commitment matter most. Training would be part of every ABC activity.",
          },
          {
            question: "How will my information be used?",
            answer: "Only to respond to your submission. Please see our privacy policy for details.",
          },
        ],
      }),
    ],
  }),
  page({
    slug: "contact",
    title: "Contact",
    hero_eyebrow: "Get in touch",
    description: "Questions, ideas or collaboration proposals: we would be glad to hear from you.",
    hero_image: ref(PHOTOS.lakeKivu),
    is_system: true,
    sections: [
      block("contact-details", "contact_details", {
        eyebrow: "Contact details",
        heading: "Ways to reach us",
        intro: "",
        show_social: true,
      }),
      block("contact-form", "form", {
        anchor: "message",
        eyebrow: "Send a message",
        heading: "How can we help?",
        intro: "Use this form for questions, partnership ideas, research collaboration or media enquiries.",
        form: "contact",
        image: null,
      }),
    ],
  }),
  page({
    slug: "privacy",
    title: "Privacy Policy",
    hero_eyebrow: "Information",
    description: "How ABC collects, uses and protects personal information submitted through this website.",
    hero_image: null,
    is_system: true,
    sections: [
      block("privacy-body", "rich_text", {
        eyebrow: "",
        heading: "",
        width: "narrow",
        background: "white",
        body: `<p>This policy explains how ABC (Alliance for Biodiversity and Conservation) handles personal information submitted through this website. Please review and adapt it with appropriate advice before relying on it.</p>
<h2>Information we collect</h2>
<p>We only collect information that you choose to send us through our forms:</p>
<ul><li><strong>Contact form:</strong> your name, email address, optional organisation, subject and message.</li><li><strong>Involvement form:</strong> your name, email address, optional phone number and location, your area of interest, optional organisation, availability, experience and message.</li><li><strong>Newsletter:</strong> your email address.</li></ul>
<p>To protect the forms from abuse, we store a one-way, anonymised hash of the network address used to submit a form for a short period. We do not store your network address itself.</p>
<h2>How we use your information</h2>
<p>We use your information only to respond to your enquiry, to consider your expression of interest, or to send you the updates you requested. We do not sell your information or share it for marketing purposes.</p>
<h2>Where information is stored</h2>
<p>Submissions are stored securely in our database, hosted by Supabase, and can only be accessed by authorised ABC administrators.</p>
<h2>How long we keep it</h2>
<p>We keep submissions only for as long as needed to respond and to manage ongoing involvement, and we delete them when they are no longer required.</p>
<h2>Your rights</h2>
<p>You can ask us to access, correct or delete the information you have sent us, or to remove you from our updates, by contacting us through our contact page.</p>
<h2>Cookies</h2>
<p>The public website does not use advertising or tracking cookies. Essential cookies are used only in the administrator area to keep authorised users signed in. A setting to reduce motion is stored in your browser if you choose to use it.</p>
<h2>Changes to this policy</h2>
<p>We may update this policy as ABC develops. The current version will always be available on this page.</p>`,
      }),
    ],
  }),
];

/* ------------------------------------------------------------------ */
/* Programmes                                                          */
/* ------------------------------------------------------------------ */

function programme(p: Omit<Programme, "id" | "seo_title" | "seo_description" | "is_published" | "is_featured" | "status">): Programme {
  return {
    id: sid(`programme:${p.slug}`),
    status: "proposed",
    is_published: true,
    is_featured: true,
    seo_title: "",
    seo_description: "",
    ...p,
  };
}

export const seedProgrammes: Programme[] = [
  programme({
    slug: "abc-learning",
    title: "ABC Learning",
    summary: "Nature learning for children and young people, connecting them with the species and ecosystems around them.",
    icon: "book-open",
    category: "Learning",
    sort_order: 1,
    cover_image: ref(PHOTOS.youthGroup),
    description: `<p>ABC Learning is the proposed programme area for environmental education. It would offer children and young people regular, hands-on opportunities to explore nature, learn to identify local species and understand how ecosystems work.</p><h2>What it could include</h2><ul><li>Guided nature walks and outdoor learning sessions</li><li>Species identification and field skills</li><li>Learning resources developed with educators</li><li>Activities linked to the proposed Community Nature Labs</li></ul><h2>Current status</h2><p>ABC Learning is a proposed programme area. Its first activities are planned as part of the proposed six-month Rwanda pilot.</p>`,
  }),
  programme({
    slug: "abc-science",
    title: "ABC Science",
    summary: "Citizen science and community research that generate useful ecological knowledge.",
    icon: "microscope",
    category: "Research",
    sort_order: 2,
    cover_image: ref(PHOTOS.akagera),
    description: `<p>ABC Science is the proposed programme area for citizen science and community research. It would equip young people and communities to observe and record biodiversity systematically and to investigate local ecological questions.</p><h2>What it could include</h2><ul><li>Structured biodiversity monitoring</li><li>Community research projects with mentors</li><li>Training in data quality and research ethics</li><li>Sharing data and findings with conservation stakeholders</li></ul><h2>Current status</h2><p>ABC Science is a proposed programme area. The pilot proposes two community research projects.</p>`,
  }),
  programme({
    slug: "abc-action",
    title: "ABC Action",
    summary: "Community-owned conservation action guided by evidence and local knowledge.",
    icon: "trees",
    category: "Conservation",
    sort_order: 3,
    cover_image: ref(PHOTOS.communityKivu),
    description: `<p>ABC Action is the proposed programme area for practical conservation. It would help communities turn what they learn into meaningful action for the species and habitats around them.</p><h2>What it could include</h2><ul><li>Habitat restoration and native planting</li><li>Awareness and community engagement activities</li><li>Collaboration with conservation authorities and organisations</li></ul><h2>Current status</h2><p>ABC Action is a proposed long-term programme area.</p>`,
  }),
  programme({
    slug: "abc-fellows",
    title: "ABC Fellows",
    summary: "Developing the next generation of youth conservation leaders and researchers.",
    icon: "graduation-cap",
    category: "Leadership",
    sort_order: 4,
    cover_image: ref(PHOTOS.youthPlanting),
    description: `<p>ABC Fellows is the proposed programme area for youth leadership. It would support committed young people to develop as conservation researchers, educators and leaders through training, mentoring and practical experience.</p><h2>What it could include</h2><ul><li>Training as youth researchers and facilitators</li><li>Mentoring from experienced practitioners</li><li>Opportunities to lead projects and share findings</li></ul><h2>Current status</h2><p>ABC Fellows is a proposed long-term programme area. The pilot proposes training a first group of youth researchers.</p>`,
  }),
  programme({
    slug: "abc-network",
    title: "ABC Network",
    summary: "A growing network connecting young people, communities, researchers and organisations.",
    icon: "network",
    category: "Network",
    sort_order: 5,
    cover_image: ref(PHOTOS.rugezi),
    description: `<p>ABC Network is the proposed programme area for connection and collaboration. Over time, it would link Nature Labs, young people, communities, researchers and organisations so that knowledge and experience can be shared widely.</p><h2>What it could include</h2><ul><li>Exchanges between Nature Lab communities</li><li>Collaboration with researchers and institutions</li><li>Shared learning, events and stories</li></ul><h2>Current status</h2><p>ABC Network is a proposed long-term programme area.</p>`,
  }),
];

/* ------------------------------------------------------------------ */
/* Stories                                                             */
/* ------------------------------------------------------------------ */

function category(name: string, slug: string, sort_order: number, description = ""): ArticleCategory {
  return { id: sid(`category:${slug}`), name, slug, description, sort_order };
}

export const seedCategories: ArticleCategory[] = [
  category("Articles", "articles", 1, "Explainers and perspectives on biodiversity and conservation."),
  category("Research Updates", "research-updates", 2, "Progress and findings from ABC research."),
  category("Field Notes", "field-notes", 3, "Observations from time spent in nature."),
  category("Photo Stories", "photo-stories", 4, "Stories told through photography."),
  category("Videos", "videos", 5, "Short films and recorded talks."),
  category("Community Stories", "community-stories", 6, "Perspectives from communities and young people."),
  category("Announcements", "announcements", 7, "News from ABC."),
];

export const seedArticles: Article[] = [
  {
    id: sid("article:introducing-abc"),
    slug: "introducing-abc",
    title: "Introducing the Alliance for Biodiversity and Conservation",
    excerpt:
      "ABC is a proposed youth-led initiative that aims to connect young people and communities with biodiversity through learning, citizen science, research and action.",
    content: `<p>Across Africa, young people grow up alongside extraordinary biodiversity: wetlands alive with cranes, forests full of primates and birdsong, and landscapes shaped by people and wildlife together. Yet many have few chances to explore that biodiversity, study it or help decide its future.</p><p>ABC, the Alliance for Biodiversity and Conservation, is a proposed youth-led initiative created to change that. Our purpose is to empower young people and communities through environmental learning, citizen science, research and collective action to protect biodiversity and sustain healthy ecosystems.</p><h2>Five connected activities</h2><p>Our approach brings together Nature Learning, Citizen Science, Community Research, Conservation Action and Conservation Storytelling. Each activity builds on the last, following a simple pathway: learn, observe, investigate, understand, act and share.</p><h2>Starting with a pilot</h2><p>ABC proposes to begin with a six-month pilot of Community Nature Learning and Citizen Science Labs at two sites in Rwanda. The pilot is designed to test the model carefully, learn from participants and build the evidence needed to grow responsibly.</p><blockquote><p>Together for All Life.</p></blockquote><p>We will share progress openly on this website. If you would like to be part of this work, please visit our Get Involved page.</p>`,
    featured_image: ref(PHOTOS.elephantsFamily),
    gallery: [],
    video_url: "",
    category_id: sid("category:announcements"),
    author_name: "ABC",
    status: "published",
    published_at: SEED_DATE,
    is_featured: true,
    seo_title: "",
    seo_description: "",
  },
  {
    id: sid("article:what-is-a-nature-lab"),
    slug: "what-is-a-nature-lab",
    title: "What is a Community Nature Lab?",
    excerpt:
      "An introduction to ABC's proposed model for community-based learning and citizen science, and the two-site pilot planned for Rwanda.",
    content: `<p>A Community Nature Learning and Citizen Science Lab, or Nature Lab, is ABC's proposed model for bringing people and biodiversity together in everyday life.</p><h2>More than a classroom</h2><p>A Nature Lab is not primarily a building. It combines a local base, a nearby natural site such as a wetland, forest edge or school garden, simple field equipment, trained facilitators and a regular programme of activities that the community helps to shape.</p><h2>What happens in a Nature Lab?</h2><ul><li><strong>Learning:</strong> children and young people explore local species and habitats.</li><li><strong>Observation:</strong> participants record what they see using simple, consistent methods.</li><li><strong>Research:</strong> youth researchers investigate questions that matter locally.</li><li><strong>Action:</strong> communities plan practical responses based on what they learn.</li><li><strong>Sharing:</strong> findings and stories are shared with the community and beyond.</li></ul><h2>The proposed Rwanda pilot</h2><p>ABC proposes to test the model through a six-month pilot at two sites in Rwanda. The pilot sites have not yet been established; they will be selected together with communities and relevant institutions.</p>`,
    featured_image: ref(PHOTOS.youthPlanting),
    gallery: [ref(PHOTOS.youthGroup), ref(PHOTOS.communityKivu), ref(PHOTOS.wetlandPlanting)],
    video_url: "",
    category_id: sid("category:articles"),
    author_name: "ABC",
    status: "published",
    published_at: SEED_DATE,
    is_featured: false,
    seo_title: "",
    seo_description: "",
  },
  {
    id: sid("article:why-citizen-science-matters"),
    slug: "why-citizen-science-matters",
    title: "Why citizen science matters for biodiversity",
    excerpt:
      "When communities observe and record nature systematically, they help fill knowledge gaps and strengthen local conservation.",
    content: `<p>Much of what we know about how species and ecosystems are changing comes from careful, repeated observation. Professional scientists cannot be everywhere, which is why citizen science, the participation of members of the public in scientific research, has become so valuable.</p><h2>Filling knowledge gaps</h2><p>Many places rich in biodiversity have relatively few long-term records. Observations gathered consistently by local people can help reveal patterns, such as when birds arrive, how wetland vegetation changes through the seasons or where important species are found.</p><h2>Building connection and skills</h2><p>Citizen science is also about people. Learning to identify species, follow a method and record data builds skills and confidence. It turns everyday surroundings into places of discovery.</p><h2>How ABC plans to use it</h2><p>Citizen science is one of ABC's five interconnected activities. In the proposed Nature Labs, participants would learn simple recording methods and, where appropriate, contribute observations to wider biodiversity databases.</p>`,
    featured_image: ref(PHOTOS.crane),
    gallery: [],
    video_url: "",
    category_id: sid("category:articles"),
    author_name: "ABC",
    status: "published",
    published_at: SEED_DATE,
    is_featured: false,
    seo_title: "",
    seo_description: "",
  },
];

/* ------------------------------------------------------------------ */
/* Impact statistics (proposed targets)                                */
/* ------------------------------------------------------------------ */

export const seedStatistics: ImpactStatistic[] = [
  {
    id: sid("stat:sites"),
    label: "Nature Lab sites",
    value: 2,
    prefix: "",
    suffix: "",
    description: "Proposed pilot sites in Rwanda",
    icon: "map-pin",
    status: "target",
    target_value: null,
    as_of: null,
    source_note: "Target set out in the ABC pilot proposal.",
    is_visible: true,
    sort_order: 1,
  },
  {
    id: sid("stat:young-people"),
    label: "Children and young people",
    value: 100,
    prefix: "",
    suffix: "",
    description: "Targeted to take part in nature learning",
    icon: "users",
    status: "target",
    target_value: null,
    as_of: null,
    source_note: "Target set out in the ABC pilot proposal.",
    is_visible: true,
    sort_order: 2,
  },
  {
    id: sid("stat:youth-researchers"),
    label: "Youth researchers",
    value: 15,
    prefix: "",
    suffix: "",
    description: "Targeted for training and mentoring",
    icon: "binoculars",
    status: "target",
    target_value: null,
    as_of: null,
    source_note: "Target set out in the ABC pilot proposal.",
    is_visible: true,
    sort_order: 3,
  },
  {
    id: sid("stat:research-projects"),
    label: "Community research projects",
    value: 2,
    prefix: "",
    suffix: "",
    description: "Proposed locally led investigations",
    icon: "microscope",
    status: "target",
    target_value: null,
    as_of: null,
    source_note: "Target set out in the ABC pilot proposal.",
    is_visible: true,
    sort_order: 4,
  },
];

/* ------------------------------------------------------------------ */
/* Organisations — PROSPECTIVE and HIDDEN by default                   */
/* ------------------------------------------------------------------ */

export const seedPartners: Partner[] = [
  "Rwanda Wildlife Conservation Association",
  "ARCOS Network",
  "African Parks",
  "BIOCOOR",
  "Rwanda Environment Management Authority",
  "University of Rwanda",
].map((name, i) => ({
  id: sid(`partner:${name}`),
  name,
  description: "Identified as a potential collaborator for future engagement. No formal relationship has been established.",
  logo: null,
  website_url: "",
  relationship: "prospective" as const,
  is_visible: false,
  sort_order: i + 1,
}));

/* ------------------------------------------------------------------ */
/* Media library (bundled photographs)                                 */
/* ------------------------------------------------------------------ */

export const seedMedia: MediaAsset[] = ALL_PHOTOS.map((p) => ({
  id: sid(`media:${p.file}`),
  url: p.src,
  storage_path: null,
  file_name: p.file,
  mime_type: "image/jpeg",
  size_bytes: 0,
  width: p.width,
  height: p.height,
  alt_text: p.alt,
  caption: p.caption,
  credit: p.credit ?? "",
  source_url: p.sourceUrl,
  folder: p.folder,
}));
