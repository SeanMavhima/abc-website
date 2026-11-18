# Testing report, known limitations and next steps

Tested on 15 November 2026 on Windows 11 with Node.js 24 and headless Chrome.

## 1. What was tested

| Check | Result |
| --- | --- |
| TypeScript (`npm run typecheck`) | Passes |
| ESLint (`npm run lint`) | Passes, no warnings |
| Production build (`npm run build`), without a database | Passes |
| Production build, connected to the live Supabase project | Passes |
| Every internal link, crawled from the homepage (41 addresses, no database) | All respond correctly; no broken links |
| The same crawl against the live database, before migration 5 | No broken links. `/explorer`, `/citizen-science`, `/research`, `/partners`, `/our-approach` and `/our-work` all respond |
| Unknown address | Returns the designed 404 page |
| `/admin` when signed out | Redirects to the login page |
| 3D homepage, desktop 1440 × 900 | Renders, no console errors, at four scroll positions |
| 3D homepage, phone 390 × 800 with touch | Renders, no console errors |
| Reduced motion | Photographic hero is shown; all sections visible; no hydration errors |
| Homepage sections: atlas, pathway, programmes, impact | Checked visually |
| Species detail page | Checked visually |
| First-load JavaScript, homepage | 219 kB. The 3D code loads separately and only when used |

Two defects were found during testing and fixed:

1. A hydration mismatch when the system asks for reduced motion (the motion setting was read during the first render). It is now read after the page loads.
2. Section headings stayed invisible under reduced motion. They now appear immediately.

## 2. What was not tested

These need things only the site owner can provide. Please check them after running migration 5.

| Not tested | Why | How to check |
| --- | --- | --- |
| **Migration 5 itself** | It was written without a database to run it on. The site owner has since run it on the live project: the new tables exist, hold the seeded content, and the activity history is recording changes. | No further action. It is safe to re-run. |
| **Admin pages for the new content** (species, atlas, labs, projects, milestones, observations, activity) | Needs migration 5 and an administrator's password. | Sign in, create and edit one item of each type, publish it and view it on the site. |
| **Observation form end to end** | Needs migration 5. | Switch submissions on in Website settings, submit one, approve it in Admin → Observations, and confirm it appears without contact details. |
| **Activity history** | Needs migration 5. | Edit anything, then open Admin → Activity history. |
| **Real phones and frame rates** | Headless Chrome uses software rendering, so it shows that the scene draws, not how fast. | Open the homepage on an ordinary Android phone. If it is not smooth, it should switch to photographs by itself within a few seconds. |
| **Ambient sound** | Headless browsers have no audio output. | Press the sound button on the homepage. |
| **Screen readers** | Not run with NVDA or VoiceOver. Semantics were written for them (tab lists, labels, a text alternative for the 3D information points) but not listened to. | Tab through the homepage with a screen reader. |
| **Deployment to Vercel or Netlify** | Needs the owner's hosting account. | Follow the README. |

Existing features (contact and involvement forms, stories, media uploads, authentication) were not changed, apart from styling, and were not re-tested end to end.

## 3. Known limitations

- **The 3D landscape is one scene.** Administrators choose its theme, text, information points and whether it is shown. They cannot build a different landscape.
- **The atlas has five fixed positions.** A habitat is placed at one of them. The drawing is illustrative and specific to Rwanda.
- **A species has one main habitat.** Species that use several are linked to their main one, with the rest described in text.
- **Observations are text only.** There is no photo upload and no map.
- **The field notebook stays on one device.** It is stored in the browser, so it does not follow a visitor to another device and is lost if they clear their browser data.
- **The site is in English only.**
- **Conservation statuses are entered by hand.** They are not fetched from the IUCN Red List and must be re-checked from time to time.
- **Species photographs are illustrative.** Several were taken in neighbouring countries, as their captions say.
- **The privacy policy is a starting draft** and should be reviewed with appropriate advice before observations are opened, because it will then cover data about children.

## 4. Recommended next steps

1. Run migration 5 and reseed (see the README), then work through the checks in section 2.
2. Have a subject specialist review the eight species entries and five habitat descriptions.
3. Translate the main pages into Kinyarwanda, checked by fluent speakers.
4. When pilot sites are agreed, add them as Nature Labs and replace illustrative photographs with ABC's own, taken with consent.
5. Before opening observations, name the people who will review them and update the privacy policy.
6. Later: a map of agreed sites, photo uploads for observations, and an offline-friendly recording page for use in the field.
