/**
 * Seed content for the Biodiversity Explorer, citizen science and the impact
 * observatory.
 *
 * Accuracy rules followed here:
 *  - Every species and ecosystem entry is EDUCATIONAL REFERENCE material. None
 *    of it is an ABC field observation, and the site says so.
 *  - Photographs are illustrative and credited; captions state where they were
 *    actually taken.
 *  - Conservation statuses are IUCN Red List categories as understood when this
 *    file was written. They change: administrators should re-check them.
 *  - No Nature Lab sites, research projects, findings or observations are
 *    seeded, because none exist yet.
 *  - Citizen science entries are PROPOSED activities from the ABC proposal.
 */
import type {
  BiodiversityCategory,
  Ecosystem,
  Milestone,
  NatureLab,
  Project,
  SourceRef,
  Species,
} from "../lib/types.ts";
import { PHOTOS, ref } from "./photos.ts";
import { sid } from "./seed-id.ts";

const IUCN: SourceRef = { label: "IUCN Red List of Threatened Species", url: "https://www.iucnredlist.org" };

/* ------------------------------------------------------------------ */
/* Ecosystems: a west-to-east transect of Rwanda                       */
/* ------------------------------------------------------------------ */

export const seedEcosystems: Ecosystem[] = [
  {
    id: sid("eco:lake"),
    slug: "great-lake-shores",
    name: "Lake Kivu and its shores",
    zone: "lake",
    elevation: "About 1,460 m",
    summary: "One of Africa's Great Lakes, edged by steep, cultivated and forested slopes.",
    description:
      "<p>Lake Kivu lies along Rwanda's western border in the Albertine Rift. Its shoreline mixes fishing communities, farmland, islands and patches of remaining woodland.</p><p>Lakeshores are meeting places between water and land. Shoreline vegetation holds soil in place, shelters young fish and provides nesting and feeding sites for waterbirds.</p>",
    processes: "Nutrient cycling between land and water\nShoreline plants stabilising soil\nFish nurseries in sheltered shallows",
    example_places: "Lake Kivu, western Rwanda",
    photo: ref(PHOTOS.lakeKivu),
    sort_order: 1,
    is_published: true,
  },
  {
    id: sid("eco:montane"),
    slug: "montane-rainforest",
    name: "Montane rainforest",
    zone: "montane_forest",
    elevation: "About 1,600 to 2,950 m",
    summary: "Cool, wet mountain forest of the Albertine Rift, rich in species found nowhere else.",
    description:
      "<p>Rwanda's mountain forests grow along the high ridge that divides the Congo and Nile river basins, and on the slopes of the Virunga volcanoes. They are part of the Albertine Rift, a region recognised for its exceptional number of endemic species.</p><p>These forests capture rain and mist and release water slowly, feeding streams that communities, farms and wetlands depend on far downstream.</p>",
    processes: "Capturing rainfall and feeding rivers\nSeed dispersal by birds and primates\nStoring carbon in trees and soils",
    example_places: "Nyungwe, Gishwati-Mukura and Volcanoes National Parks",
    photo: ref(PHOTOS.nyungweForest),
    sort_order: 2,
    is_published: true,
  },
  {
    id: sid("eco:hills"),
    slug: "hills-and-farmland",
    name: "Hills and farmland",
    zone: "hills",
    elevation: "About 1,500 to 2,000 m",
    summary: "The cultivated hills where most people live, and where everyday biodiversity is closest to hand.",
    description:
      "<p>Much of Rwanda is a landscape of terraced hills, fields, homesteads, school grounds and scattered trees. It is easy to overlook, but it is full of life: pollinating insects, garden birds, wild plants along paths and field edges.</p><p>For most young people this is where an interest in nature begins. A school garden, a hedgerow or a single fig tree can be a place to learn how to observe carefully.</p>",
    processes: "Pollination of crops and wild plants\nTrees and hedges reducing soil erosion\nSoil organisms recycling nutrients",
    example_places: "Rwanda's central plateau",
    photo: ref(PHOTOS.nyungweSunrise),
    sort_order: 3,
    is_published: true,
  },
  {
    id: sid("eco:wetland"),
    slug: "wetlands-and-marshes",
    name: "Wetlands and marshes",
    zone: "wetland",
    elevation: "About 1,300 to 2,100 m",
    summary: "Valley marshes, papyrus swamps and highland peatlands that store and clean water.",
    description:
      "<p>Wetlands fill many of Rwanda's valley bottoms, from papyrus swamps along lowland rivers to the highland Rugezi marsh, which is recognised as a wetland of international importance under the Ramsar Convention.</p><p>Wetlands slow floodwater, filter sediment, hold carbon in waterlogged soils and give refuge to cranes, kingfishers, frogs and many other species. They are also among the habitats under greatest pressure.</p>",
    processes: "Storing water and reducing floods\nFiltering sediment and nutrients\nLocking carbon away in peat",
    example_places: "Rugezi marsh, Akanyaru and Nyabarongo wetlands",
    photo: ref(PHOTOS.rugezi),
    sort_order: 4,
    is_published: true,
  },
  {
    id: sid("eco:savanna"),
    slug: "savanna-and-eastern-lakes",
    name: "Savanna and eastern lakes",
    zone: "savanna",
    elevation: "About 1,250 to 1,800 m",
    summary: "Open grassland, woodland and a chain of lakes and swamps in Rwanda's warmer east.",
    description:
      "<p>Eastern Rwanda is lower, warmer and drier. Grassland and acacia woodland run down to lakes and papyrus swamps along the Akagera River.</p><p>Large grazing and browsing animals shape this landscape. By feeding, trampling and moving seeds and nutrients, they keep a shifting mosaic of grass, shrubs and trees that many other species rely on.</p>",
    processes: "Grazing and browsing shaping vegetation\nLarge animals moving seeds and nutrients\nSeasonal cycles of rain, growth and fire",
    example_places: "Akagera National Park",
    photo: ref(PHOTOS.akagera),
    sort_order: 5,
    is_published: true,
  },
];

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export const seedBioCategories: BiodiversityCategory[] = [
  { id: sid("biocat:birds"), name: "Birds", slug: "birds", description: "From wetland cranes to forest turacos.", icon: "bird", sort_order: 1 },
  { id: sid("biocat:mammals"), name: "Mammals", slug: "mammals", description: "Primates, grazers and other mammals.", icon: "footprints", sort_order: 2 },
  { id: sid("biocat:insects"), name: "Insects", slug: "insects", description: "Pollinators, recyclers and food for many others.", icon: "bug", sort_order: 3 },
  { id: sid("biocat:plants"), name: "Plants", slug: "plants", description: "Trees, wetland plants and wildflowers.", icon: "flower", sort_order: 4 },
];

/* ------------------------------------------------------------------ */
/* Species (educational reference entries)                             */
/* ------------------------------------------------------------------ */

type SpeciesSeed = Omit<Species, "id" | "entry_type" | "status" | "sources" | "category" | "ecosystem" | "sort_order"> & {
  sources?: SourceRef[];
};

const speciesSeeds: SpeciesSeed[] = [
  {
    slug: "grey-crowned-crane",
    common_name: "Grey Crowned Crane",
    scientific_name: "Balearica regulorum",
    local_name: "Umusambi",
    category_id: sid("biocat:birds"),
    ecosystem_id: sid("eco:wetland"),
    photo: ref(PHOTOS.crane),
    summary: "A tall wetland bird with a crown of stiff golden feathers, known for its dancing displays.",
    description:
      "<p>The Grey Crowned Crane is one of the most recognisable birds of eastern and southern Africa. Pairs perform elaborate dances of bowing, jumping and wing-spreading, and they nest in wetlands, hiding their eggs among tall vegetation.</p><p>Unlike most cranes, it can roost in trees, using a long hind toe to grip branches.</p>",
    habitat: "Marshes, flooded grassland and farmland close to water. It needs undisturbed wetland to nest.",
    ecological_role:
      "Feeds on seeds, insects and other small animals. Because it depends on healthy marshes to breed, its presence says something about the condition of a wetland.",
    conservation_status: "EN",
    conservation_notes: "The main pressures are the loss and drainage of wetlands and the illegal capture of birds and eggs.",
    is_featured: true,
  },
  {
    slug: "mountain-gorilla",
    common_name: "Mountain gorilla",
    scientific_name: "Gorilla beringei beringei",
    local_name: "Ingagi",
    category_id: sid("biocat:mammals"),
    ecosystem_id: sid("eco:montane"),
    photo: ref(PHOTOS.gorilla),
    summary: "A great ape of high mountain forest, living in close family groups led by a silverback.",
    description:
      "<p>Mountain gorillas live only in two areas: the Virunga volcanoes shared by Rwanda, Uganda and the Democratic Republic of the Congo, and Bwindi Impenetrable National Park in Uganda.</p><p>They spend most of the day feeding on leaves, stems and shoots, and build a fresh nest of vegetation to sleep in each night.</p>",
    habitat: "Montane and bamboo forest on the slopes of the Virunga volcanoes.",
    ecological_role:
      "As large plant-eaters, gorillas open up vegetation as they feed and move, creating space and light for other plants, and they spread seeds in their dung.",
    conservation_status: "EN",
    conservation_notes:
      "Published censuses have recorded a slow increase to just over 1,000 individuals, following decades of intensive protection. The population remains small and confined to two areas.",
    is_featured: true,
  },
  {
    slug: "african-savanna-elephant",
    common_name: "African savanna elephant",
    scientific_name: "Loxodonta africana",
    local_name: "Inzovu",
    category_id: sid("biocat:mammals"),
    ecosystem_id: sid("eco:savanna"),
    photo: ref(PHOTOS.elephantsFamily),
    summary: "The largest living land animal, moving in family herds led by older females.",
    description:
      "<p>Savanna elephants live in herds of related females and their young, guided by a matriarch whose memory of water and feeding places can matter greatly in dry years.</p><p>They communicate with touch, scent and low rumbles, some of which travel long distances.</p>",
    habitat: "Savanna, woodland and wetland edges.",
    ecological_role:
      "Often described as ecosystem engineers. By pushing over trees, digging for water and carrying seeds long distances, elephants reshape habitats that many other species use.",
    conservation_status: "EN",
    conservation_notes: "Threatened by poaching for ivory and by the loss and fragmentation of habitat.",
    is_featured: true,
  },
  {
    slug: "eastern-chimpanzee",
    common_name: "Eastern chimpanzee",
    scientific_name: "Pan troglodytes schweinfurthii",
    local_name: "Impundu",
    category_id: sid("biocat:mammals"),
    ecosystem_id: sid("eco:montane"),
    photo: ref(PHOTOS.chimpanzee),
    summary: "A highly social great ape that uses tools and lives in large, shifting communities.",
    description:
      "<p>Chimpanzees live in communities whose members split into smaller parties and come back together through the day. They use sticks, leaves and stones as tools, and different communities have different habits.</p><p>In Rwanda, chimpanzees live in mountain forest.</p>",
    habitat: "Forest, from lowland rainforest to high montane forest.",
    ecological_role:
      "Chimpanzees eat a great deal of fruit and carry the seeds far from the parent tree, helping forests to regenerate.",
    conservation_status: "EN",
    conservation_notes: "Threatened by forest loss, hunting and disease.",
    is_featured: false,
  },
  {
    slug: "great-blue-turaco",
    common_name: "Great blue turaco",
    scientific_name: "Corythaeola cristata",
    local_name: "",
    category_id: sid("biocat:birds"),
    ecosystem_id: sid("eco:montane"),
    photo: ref(PHOTOS.turaco),
    summary: "The largest of the turacos, a blue-green forest bird with a tall dark crest.",
    description:
      "<p>Great blue turacos move through the forest canopy in small groups, running and bounding along branches more often than they fly. Their deep, rolling calls carry a long way.</p>",
    habitat: "The canopy of rainforest and montane forest, and tall trees along rivers.",
    ecological_role: "Feeds mainly on fruit and leaves, and spreads the seeds of many forest trees.",
    conservation_status: "LC",
    conservation_notes: "Widespread, but dependent on forest with large fruiting trees.",
    is_featured: false,
  },
  {
    slug: "hippopotamus",
    common_name: "Hippopotamus",
    scientific_name: "Hippopotamus amphibius",
    local_name: "Imvubu",
    category_id: sid("biocat:mammals"),
    ecosystem_id: sid("eco:savanna"),
    photo: ref(PHOTOS.hippo),
    summary: "A very large, semi-aquatic mammal that rests in water by day and grazes on land at night.",
    description:
      "<p>Hippos spend the day in lakes and rivers, which keeps their skin cool and moist. At dusk they leave the water and walk to grazing areas, returning before dawn.</p>",
    habitat: "Lakes, rivers and swamps with grassland nearby.",
    ecological_role:
      "By grazing on land and resting in water, hippos carry nutrients from grassland into lakes and rivers, where they feed aquatic life.",
    conservation_status: "VU",
    conservation_notes: "Threatened by habitat loss and hunting.",
    is_featured: false,
  },
  {
    slug: "malachite-kingfisher",
    common_name: "Malachite kingfisher",
    scientific_name: "Corythornis cristatus",
    local_name: "",
    category_id: sid("biocat:birds"),
    ecosystem_id: sid("eco:wetland"),
    photo: ref(PHOTOS.kingfisher),
    summary: "A tiny, jewel-bright kingfisher of reeds and quiet water.",
    description:
      "<p>The malachite kingfisher perches low over the water on reeds and stems, then dives for its prey. It is small enough to overlook, but its blue back and orange underside are unmistakable once seen.</p>",
    habitat: "Reeds and vegetation beside slow rivers, ponds, lakes and marshes.",
    ecological_role: "A predator of small fish, tadpoles and aquatic insects, and an easy species for new observers to learn at a wetland.",
    conservation_status: "LC",
    conservation_notes: "Widespread across Africa south of the Sahara where there is suitable water.",
    is_featured: true,
  },
  {
    slug: "african-monarch",
    common_name: "African monarch",
    scientific_name: "Danaus chrysippus",
    local_name: "",
    category_id: sid("biocat:insects"),
    ecosystem_id: sid("eco:hills"),
    photo: ref(PHOTOS.monarch),
    summary: "A common orange butterfly of gardens and open country, protected by chemicals from its food plants.",
    description:
      "<p>The African monarch, also called the plain tiger, is one of the most familiar butterflies in Africa. Its caterpillars feed on milkweeds and store the plants' toxins, which makes both caterpillar and adult distasteful to many predators.</p><p>Its bold orange, black and white pattern is a warning, and several other butterflies have evolved to look like it.</p>",
    habitat: "Open, sunny places: gardens, fields, roadsides and grassland.",
    ecological_role: "Adults visit flowers for nectar and can carry pollen between them. Caterpillars and adults are part of the food web for the predators that tolerate them.",
    conservation_status: "",
    conservation_notes: "Widespread and common. Check the IUCN Red List for its current assessment.",
    is_featured: false,
  },
];

export const seedSpecies: Species[] = speciesSeeds.map((s, i) => ({
  ...s,
  id: sid(`species:${s.slug}`),
  entry_type: "reference",
  status: "published",
  sources: s.sources ?? [IUCN],
  sort_order: i + 1,
}));

/* ------------------------------------------------------------------ */
/* Nature Labs and research: nothing exists yet, so nothing is seeded  */
/* ------------------------------------------------------------------ */

export const seedNatureLabs: NatureLab[] = [];
export const seedResearchProjects: Project[] = [];

/* ------------------------------------------------------------------ */
/* Citizen science: proposed activities                                */
/* ------------------------------------------------------------------ */

const proposedNote =
  "<p>This is a proposed activity. Its methods, timing and location will be agreed with participating communities before anything begins.</p>";

function project(key: string, p: Pick<Project, "slug" | "title" | "summary" | "research_question" | "methods" | "participation" | "cover_image">, order: number): Project {
  return {
    id: sid(`cs:${key}`),
    description: proposedNote,
    findings: "",
    status: "proposed",
    lab_id: null,
    starts_on: null,
    ends_on: null,
    sort_order: order,
    is_published: true,
    ...p,
  };
}

export const seedCitizenScience: Project[] = [
  project(
    "birds",
    {
      slug: "community-bird-recording",
      title: "Community bird recording",
      summary: "Regular, repeated counts of the birds seen at a local site, made by young people using a simple shared method.",
      research_question: "Which birds use our local site, and how does that change through the year?",
      methods: "Walk or watch from the same place at the same time of day\nRecord every species seen or heard, and how many\nNote the date, weather and habitat\nCheck uncertain identifications together before records are kept",
      participation: "Proposed for young people and community members at each pilot Nature Lab, supported by a trained facilitator.",
      cover_image: ref(PHOTOS.craneWetland),
    },
    1,
  ),
  project(
    "plants",
    {
      slug: "local-plant-survey",
      title: "Local plant survey",
      summary: "Building a shared record of the trees and plants around a community, including the names and uses people know them by.",
      research_question: "Which plants grow around us, what do we call them, and how are they used?",
      methods: "Mark out small survey plots or follow a fixed path\nPhotograph and describe each plant\nRecord local names and uses shared by knowledge holders, with their agreement\nReview identifications with a mentor",
      participation: "Proposed as a joint activity between young people and local knowledge holders.",
      cover_image: ref(PHOTOS.nyungweForest),
    },
    2,
  ),
  project(
    "pollinators",
    {
      slug: "pollinator-watch",
      title: "Pollinator watch",
      summary: "Timed observations of the insects visiting flowers in gardens, fields and field edges.",
      research_question: "Which insects visit the flowers in our gardens and fields?",
      methods: "Choose a flowering plant and watch it for a fixed number of minutes\nCount each kind of visitor: bees, butterflies, flies, beetles and others\nRepeat on different days and plants\nCompare results between sites",
      participation: "Proposed for school groups, using school gardens and nearby farmland.",
      cover_image: ref(PHOTOS.monarch),
    },
    3,
  ),
];

/* ------------------------------------------------------------------ */
/* Milestones: planned stages of the proposed pilot                    */
/* ------------------------------------------------------------------ */

function milestone(key: string, title: string, description: string, order: number): Milestone {
  return { id: sid(`milestone:${key}`), title, description, period: "Proposed pilot", status: "planned", sort_order: order, is_visible: true };
}

export const seedMilestones: Milestone[] = [
  milestone("sites", "Agree pilot sites with communities", "Select two sites together with communities and relevant institutions.", 1),
  milestone("learning", "Begin nature learning sessions", "Regular hands-on sessions for children and young people.", 2),
  milestone("researchers", "Train youth researchers", "Field methods, careful recording and research ethics.", 3),
  milestone("research", "Support community research projects", "Two locally led investigations into questions communities choose.", 4),
  milestone("share", "Share what was learned", "Present findings to communities and publish results openly.", 5),
];
