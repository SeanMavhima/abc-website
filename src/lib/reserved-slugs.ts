/** Page slugs that are handled by dedicated routes and cannot be used for CMS pages. */
export const RESERVED_SLUGS = ["admin", "api", "programmes", "stories", "credits", "notebook", "sitemap", "robots", "icon", "_next"];

/** Slugs rendered by dedicated routes but whose header/sections still come from the pages table. */
export const DEDICATED_ROUTE_PAGES = ["programmes", "stories"];
