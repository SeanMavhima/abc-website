# Architecture and feature decisions

This records what was built on top of the original site, what was left out, and why. It is written for whoever maintains the project next.

## 1. Starting point

The repository already held a working Next.js 15 (App Router), React 19, Tailwind CSS 4 and Supabase site: a block-based CMS, Row Level Security, rate-limited forms, a media library and 14 licensed photographs. That foundation was kept. Everything below extends it.

## 2. The 3D homepage

| Decision | Reason |
| --- | --- |
| **Three.js with React Three Fiber**, loaded with a dynamic import | The 3D code is in its own bundle. Pages that do not use it, and visitors who get photographs, never download it. |
| **Fully procedural landscape** (`src/components/experience/world.ts`) | Terrain, trees, reeds, water, mist, birds and particles are generated from code. There are no model or texture files, so there is nothing to license and nothing heavy to download. |
| **Small GLSL additions** instead of a shader framework | Wind is a few lines added to Three's built-in material. Water, sky and particles are short custom shaders. |
| **Scroll drives the camera** | The journey from forest canopy to the water's edge mirrors the pathway from discovery to protection. Chapter text changes with it. |
| **Information points are HTML buttons** placed over the canvas | They can be reached by keyboard and read by screen readers. A hidden list repeats the same information. |
| **@react-three/drei not added** | Nothing here needed it, and it would have enlarged the bundle. |
| **WebGPU not used** | Browser support is still uneven. WebGL 2 with a WebGL 1 fallback covers almost every device. |
| **GSAP not added** | Motion (already installed) covers every animation on the site. |
| **Sound is synthesised** with the Web Audio API (`soundscape.ts`) | Wind, water and bird calls are generated in the browser. No audio files, no licences. It only starts when a visitor presses the sound button. |

### When the 3D landscape is not shown

`use-immersive.ts` and `hero-experience.tsx` choose photographs instead when any of these is true:

- the administrator chose "Photographs only" for the hero
- the visitor's system asks for reduced motion, or they used the site's "Reduce motion" switch
- the visitor switched 3D off (footer or hero button, remembered on their device)
- the browser has no WebGL, or the device reports data-saver mode, two or fewer processor cores, or one gigabyte of memory or less
- the scene could not hold about 15 frames per second after lowering its resolution

Devices that pass but are modest (four cores or fewer, four gigabytes or less, or a small touch screen) get a lighter scene: fewer trees and reeds, a coarser terrain and a lower resolution. Rendering stops whenever the hero is off screen.

### What administrators can change

In **Admin → Homepage → Hero**: headline, text, buttons, 3D on or off, visual theme (dawn, day, dusk, or follow the visitor's clock), whether to offer sound, the chapters, the information points and their links, and the fallback photographs. Administrators cannot build new 3D environments: the landscape itself is code.

## 3. Distinctive features

| Feature | What was built | Notes |
| --- | --- | --- |
| **Living Atlas** | An illustrated west-to-east cross-section of Rwanda's habitats. Selecting a habitat shows how it works and which species live there. | A drawing, not a map. See "Why not a map" below. |
| **Nature Explorer** | Species entries with search, group and habitat filters, detail pages, IUCN categories and sources. | Every entry is marked as educational reference or ABC field observation. |
| **Citizen Science Observatory** | Project pages with question, method, status and findings, plus a moderated observation form. | The form is closed by default and the page says so. |
| **Research-to-Action Journey** | The six stages on a ring that visitors step through, with activities and the link to the next stage. | Built as a tab list, so arrow keys work. |
| **Nature Lab Explorer** | The Nature Labs page plus a managed list of sites. | No sites are seeded, because none exists. |
| **Storytelling** | The existing stories system, restyled. | Unchanged in structure. |
| **Impact Observatory** | Figures with status, date, source and optional progress, plus a milestone timeline. | Targets are drawn as outlines and results as solid numbers. |

### Additional ideas considered

| Idea | Decision | Reason |
| --- | --- | --- |
| Synthesised ambient soundscape | **Built** | Adds atmosphere at no cost and with no assets. Opt-in. |
| Time-of-day theme | **Built** | The landscape follows the visitor's own clock. Free and immediately noticeable. |
| Field notebook | **Built** | Visitors save species and write notes, stored only in their browser, and can print a field guide. No accounts, no personal data. |
| Connected life | **Built** | Each species page lists others that share its habitat. |
| Visitor "3D off" switch | **Built** | Useful where data and battery are limited. |
| Kinyarwanda and French versions | **Not built** | Needs translation checked by fluent speakers. Recommended next. |
| Photo uploads with observations | **Not built** | Public uploads need storage quotas and image moderation. Text-only for now. |
| Printable recording sheets | **Not built** | Depends on methods that will be agreed with communities. |

### Why not a map

MapLibre was considered for the atlas. It was not used because:

1. ABC has no field sites or observations yet, so a map would have nothing of ABC's own to show.
2. A map needs a tile service. Free tile services have usage limits and can change their terms, which adds a dependency the site does not otherwise have.
3. A cross-section cannot reveal where a sensitive species was seen.

When there are real, agreed sites to show, adding a map is a contained piece of work: an optional latitude and longitude on `nature_labs`, and one new section type.

## 4. Data model

Migration 5 (`supabase/migrations/20261115000005_explorer_observatory.sql`) adds:

- `ecosystems`, `biodiversity_categories`, `species` (linked to a group and a habitat)
- `nature_labs`, `citizen_science_projects`, `research_projects` (projects can belong to a lab)
- `milestones`
- `observations`, with a privacy-safe view `public_observations`
- `audit_log`, written by database triggers
- on `impact_statistics`: a `verified` status, `target_value`, `as_of` and `source_note`
- on `site_settings`: `observations_open`

Security follows the existing rules. Visitors read published rows only. Administrators (`profiles.role = 'admin'`) can write. Visitors can never read the `observations` table: they see only the view, which returns approved, consented rows without contact details, and hides the names of anyone under 18. Observations are written only through the rate-limited `submit_form()` function, which refuses them while submissions are closed.

The audit log is filled by triggers, so no change made through the CMS, a script or the Supabase dashboard can skip it. It is read-only, even for administrators.

## 5. Pages

The Explorer, Citizen Science, Research and Partners pages are ordinary CMS pages built from sections, so administrators can rearrange them. Only detail pages have dedicated routes: `/explorer/[slug]`, `/citizen-science/[slug]` and `/research/[slug]`.

If the code is deployed before migration 5 is run, the site still works: new sections show the bundled reference content, the four new pages are served from the bundled starter content, and admin pages for new content explain which migration to run.

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| 3D is slow on a device | Capability checks, a lighter tier, a frame-rate guard and the photographic fallback. |
| Reference content mistaken for ABC's own findings | Every entry carries its type, and disclosure notes are editable but present by default. |
| Targets mistaken for results | One status vocabulary, used everywhere, with targets drawn differently. |
| Conservation statuses go out of date | Entries link to the IUCN Red List and say that statuses change. Administrators should re-check them yearly. |
| Abuse of the observation form | Closed by default, rate limited, honeypot and timing checks, and nothing is published without approval. |
