/** Converts the seed module into database rows, table by table, in insert order. */
import {
  seedArticles,
  seedCategories,
  seedHomepageRows,
  seedMedia,
  seedNavigation,
  seedPages,
  seedPartners,
  seedProgrammes,
  seedSettings,
  seedStatistics,
} from "../../src/content/seed.ts";
import {
  seedBioCategories,
  seedCitizenScience,
  seedEcosystems,
  seedMilestones,
  seedNatureLabs,
  seedResearchProjects,
  seedSpecies,
} from "../../src/content/seed-nature.ts";

export type SeedTable = { table: string; rows: Record<string, unknown>[] };

export function seedTables(): SeedTable[] {
  const navParents = seedNavigation.filter((n) => !n.parent_id);
  const navChildren = seedNavigation.filter((n) => n.parent_id);
  return [
    { table: "site_settings", rows: [{ id: 1, ...seedSettings }] },
    { table: "navigation_items", rows: navParents },
    { table: "navigation_items", rows: navChildren },
    { table: "homepage_sections", rows: seedHomepageRows },
    { table: "pages", rows: seedPages },
    { table: "programmes", rows: seedProgrammes },
    { table: "article_categories", rows: seedCategories },
    { table: "articles", rows: seedArticles.map(({ category: _c, ...a }) => (void _c, a)) },
    { table: "impact_statistics", rows: seedStatistics },
    { table: "partners", rows: seedPartners },
    { table: "media_assets", rows: seedMedia },
    { table: "ecosystems", rows: seedEcosystems },
    { table: "biodiversity_categories", rows: seedBioCategories },
    { table: "species", rows: seedSpecies },
    { table: "nature_labs", rows: seedNatureLabs },
    { table: "citizen_science_projects", rows: seedCitizenScience },
    { table: "research_projects", rows: seedResearchProjects },
    { table: "milestones", rows: seedMilestones },
  ];
}
