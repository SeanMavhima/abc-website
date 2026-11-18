# ABC — Alliance for Biodiversity and Conservation

**Together for All Life.**

The official website and content management system (CMS) for ABC, a proposed youth-led initiative connecting young people and communities with biodiversity through environmental learning, citizen science, research and conservation action.

- **Public website:** an interactive 3D homepage, About, Our Approach, Nature Labs, Programmes, the Biodiversity Explorer (a living atlas of habitats and a species explorer), Citizen Science, Research & Insights, Stories & Media, Get Involved, Partners, Contact, Privacy Policy, Image credits and a personal field notebook.
- **Admin CMS at `/admin`:** edit the website without code: homepage sections and the 3D opening, pages, programmes, Nature Labs, atlas habitats, species, citizen science and research projects, stories, team, organisations, impact statistics, milestones, media, navigation, footer, branding and settings. It also moderates community observations, manages form submissions with CSV export, and keeps an activity history.

**Upgrading an existing installation?** Go straight to [Upgrading to this version](#16-upgrading-to-this-version).

More detail: [architecture and feature decisions](docs/ARCHITECTURE.md) · [testing report and limitations](docs/TESTING-AND-LIMITATIONS.md) · [guide for administrators](docs/CONTENT-GUIDE.md).

Everything uses free, open-source software and free hosting tiers.

---

## Contents

1. [Technology](#1-technology)
2. [Project structure](#2-project-structure)
3. [Quick start (preview without a database)](#3-quick-start-preview-without-a-database)
4. [Set up Supabase](#4-set-up-supabase)
5. [Environment variables](#5-environment-variables)
6. [Load the initial content](#6-load-the-initial-content)
7. [Create the first administrator](#7-create-the-first-administrator)
8. [Run locally](#8-run-locally)
9. [Deploy to Vercel](#9-deploy-to-vercel)
10. [Deploy to Netlify](#10-deploy-to-netlify)
11. [Changing content without touching code](#11-changing-content-without-touching-code)
12. [Content accuracy rules](#12-content-accuracy-rules)
13. [Security model](#13-security-model)
14. [Photographs and credits](#14-photographs-and-credits)
15. [Troubleshooting](#15-troubleshooting)
16. [Upgrading to this version](#16-upgrading-to-this-version)
17. [The 3D homepage](#17-the-3d-homepage)
18. [Custom domain](#18-custom-domain)
19. [Costs and free-tier limits](#19-costs-and-free-tier-limits)

---

## 1. Technology

| Area | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui-style components, Lucide icons |
| Animation | Motion for React (respects `prefers-reduced-motion`, plus an on-site "Reduce motion" toggle) |
| 3D | Three.js with React Three Fiber, custom GLSL. Procedural: no model, texture or audio files |
| Database | Supabase PostgreSQL with Row Level Security |
| Auth | Supabase Authentication (email + password, no public sign-up) |
| Media | Supabase Storage (public `media` bucket, admin-only writes) |
| Forms | React Hook Form + Zod (validated again on the server) |
| Rich text | Tiptap (output sanitised on save and on render) |
| Hosting | Vercel (recommended) or Netlify |

Requires **Node.js 22.18 or newer** (the seed scripts use Node's built-in TypeScript support).

## 2. Project structure

```
src/
  app/
    (site)/               Public website (statically generated, revalidated on save)
      page.tsx            Homepage (built from homepage sections)
      [slug]/             Any CMS page: about, our-work, nature-labs, get-involved, contact, privacy, ...
      programmes/         Programme list + /programmes/[slug]
      stories/            Stories & Insights (search, filters) + /stories/[slug]
      explorer/[slug]/    Species pages (the Explorer itself is a CMS page)
      citizen-science/[slug]/, research/[slug]/   Project pages
      notebook/           The visitor's field notebook (stored in their browser)
      credits/            Image credits (from the media library)
    admin/
      login, forgot-password, reset-password, auth/callback
      (dashboard)/        Protected CMS: overview, homepage, pages, programmes, stories,
                          categories, team, partners, statistics, media, navigation,
                          settings, submissions/[kind], account, administrators,
                          nature-labs, atlas, species, species-groups, citizen-science,
                          research, observations, milestones, activity
      export/[kind]/      CSV export (admin only)
    sitemap.ts, robots.ts, icon.svg
  components/
    site/                 Header, footer, page hero, cards, motion, images
    experience/           The 3D homepage: landscape, scene, sound, device checks
    nature/               Living atlas, species explorer, field notebook
    blocks/               Section renderers (hero, cards, pathway, atlas, stats...)
    forms/                Public contact, involvement and newsletter forms
    admin/                CMS components: section editor, field editor, media picker,
                          rich text editor, collection manager...
    ui/                   Buttons, inputs, dialog, badges
  lib/
    blocks.ts             Section ("block") registry: every section type and its fields
    data/public.ts        Read-only queries for the public site
    actions/              Server actions (public forms + admin CRUD)
    validation/           Zod schemas and server-side sanitising
    supabase/             Supabase clients (public, server, browser, service)
    auth.ts               Administrator checks used by every admin page and action
  content/
    seed.ts               Initial content from the ABC proposal (single source of truth)
    seed-nature.ts        Habitats, species, proposed citizen science, milestones
    photos.ts             Bundled photographs with credits
  middleware.ts           Session refresh + login redirect for /admin
supabase/
  migrations/             SQL: schema, Row Level Security, storage, media usage, explorer and observatory
  seed.sql                Generated seed (alternative to `npm run seed`)
scripts/                  seed, generate-seed-sql, create-admin
public/images/photos/     Optimised photographs (+ CREDITS.md)
docs/                     Administrator guide, architecture decisions, testing report
```

**How sections work.** The homepage and every page are made of *sections* (blocks) such as Hero, Image and text, Cards, Process/pathway, Impact statistics, Programmes, Stories, Organisations, Team, Form, Questions, Gallery and Call to action. `src/lib/blocks.ts` describes each section's fields. The admin editor builds its forms from that description and the public site renders from the same data, so administrators never edit HTML or JSON.

## 3. Quick start (preview without a database)

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Supabase variables the site runs in **development preview mode**: it shows the bundled seed content with a clearly labelled banner. Forms explain that they are not connected and send nothing, and `/admin` shows setup instructions. Nothing pretends to be live.

## 4. Set up Supabase

1. Create a free project at https://supabase.com.
2. **Run the migrations.** In the Supabase dashboard open **SQL Editor** and run each file in `supabase/migrations/` **in order**:
   1. `20261115000001_schema.sql`: tables, triggers, rate-limited form function
   2. `20261115000002_row_level_security.sql`: permissions
   3. `20261115000003_storage.sql`: the `media` storage bucket and its policies
   4. `20261115000004_media_usage.sql`: "where is this image used" lookup
   5. `20261115000005_explorer_observatory.sql`: habitats, species, Nature Labs, projects, milestones, observations, activity history

   If you use the Supabase CLI instead: `supabase link --project-ref <ref>` then `supabase db push`.
3. **Check Storage.** Under **Storage** you should see a public bucket named `media` (10 MB limit for images is enforced in the CMS, 50 MB per file and the allowed file types are enforced by Supabase). If it is missing, re-run migration 3.
4. **Disable public sign-up.** Go to **Authentication → Sign In / Providers** and turn **off** "Allow new users to sign up". (Even if someone did sign up, they would have no administrator role and could not access anything, but there is no reason to allow it.)
5. **Configure auth URLs** (needed for password-reset emails). In **Authentication → URL Configuration**:
   - **Site URL:** your production URL, e.g. `https://abc-example.vercel.app`
   - **Redirect URLs:** add `http://localhost:3000/admin/auth/callback` and `https://YOUR-DOMAIN/admin/auth/callback`

   The free tier's built-in email sender is rate limited. For reliable password-reset emails, add a free SMTP provider under **Authentication → Emails → SMTP Settings**.

## 5. Environment variables

Copy `.env.example` to `.env.local` and fill in values from **Project Settings → API**:

| Variable | Where it is used | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Everywhere | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Everywhere (protected by RLS) | No |
| `NEXT_PUBLIC_SITE_URL` | SEO, sitemap, Open Graph, reset links | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed/admin scripts and the Administrators page, **server only** | **Yes** |
| `FORM_HASH_SALT` | Hashing visitor IPs for form rate limiting | **Yes** |

Never prefix the service-role key with `NEXT_PUBLIC_` and never commit `.env.local` (it is git-ignored). The site works without the service-role key in production; you only lose the "Add administrator" form.

## 6. Load the initial content

Choose one:

- **Script:** `npm run seed`. It refuses to run if content already exists; `npm run seed -- --force` re-applies the seeded rows (anything you added is kept, but seeded rows you edited are overwritten).
- **SQL:** paste `supabase/seed.sql` into the SQL Editor. It uses `ON CONFLICT DO NOTHING`, so it never overwrites edits. Regenerate it after changing `src/content/seed.ts` with `npm run seed:sql`.

The seed contains settings, navigation, the homepage, the core pages, five proposed programme areas, story categories, three introductory stories, the four proposed pilot targets, five planned milestones, six prospective organisations (hidden), five habitats, eight species (reference entries), three proposed citizen science activities and the 19 bundled photographs. It contains no Nature Lab sites, research projects or observations, because none exists yet.

## 7. Create the first administrator

There is **no public registration**. Use one of these methods:

**Option A: script (recommended).** Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`:

```bash
npm run create-admin -- --email you@example.org --password "a-long-unique-password" --name "Your Name"
```

Run it again with an existing email to grant that account administrator access (and optionally reset its password).

**Option B: dashboard + SQL.**

1. **Authentication → Users → Add user → Create new user**, enter email and password, and tick **Auto Confirm User**.
2. In the **SQL Editor** run:
   ```sql
   update public.profiles set role = 'admin', full_name = 'Your Name'
   where email = 'you@example.org';
   ```

Then sign in at `/admin/login`. Further administrators can be added from **Admin → Administrators** (when the service-role key is set) or with either method above. Administrator access can be removed there too; the last administrator cannot be removed.

## 8. Run locally

```bash
npm run dev         # development server on http://localhost:3000
npm run build       # production build
npm start           # serve the production build
npm run typecheck   # TypeScript
npm run lint        # ESLint
```

## 9. Deploy to Vercel

1. Push this repository to GitHub, GitLab or Bitbucket.
2. In Vercel: **Add New → Project**, import the repository (framework is detected automatically).
3. Add the environment variables from section 5. Set `NEXT_PUBLIC_SITE_URL` to your Vercel or custom domain.
4. Deploy. Add the deployed URL to Supabase **Site URL** and **Redirect URLs** (section 4.5).

Public pages are pre-rendered and served from the edge cache. Saving in the CMS revalidates them immediately; they also refresh automatically every five minutes.

## 10. Deploy to Netlify

`netlify.toml` is included. Netlify detects Next.js and applies its Next.js runtime, which supports server actions, middleware and image optimisation.

1. **Add new site → Import an existing project**, choose the repository.
2. The build command (`npm run build`) and publish directory (`.next`) come from `netlify.toml`.
3. Add the environment variables from section 5 under **Site configuration → Environment variables**.
4. Deploy, then add the site URL to Supabase **Site URL** and **Redirect URLs**.

## 11. Changing content without touching code

See **[docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md)** for a step-by-step guide for administrators. In short:

| To change… | Go to |
| --- | --- |
| Hero photographs, headline, buttons, slideshow timing, homepage sections | **Homepage** |
| About, Our Work, Nature Labs, Get Involved, Contact, Privacy, or a new page | **Pages** |
| The 3D opening: theme, chapters, information points, sound, on or off | **Homepage → Hero** |
| Programme areas and their detail pages | **Programmes** |
| Nature Lab sites | **Nature Labs** |
| Habitats on the living atlas | **Atlas habitats** |
| Species entries and their groups | **Species**, **Species groups** |
| Citizen science and research projects | **Citizen science**, **Research projects** |
| Community observations (approve or reject) | **Observations** |
| The planned-stages timeline | **Milestones** |
| Who changed what, and when | **Activity history** |
| Articles, research updates, field notes, photo stories, videos | **Stories** (and **Story categories**) |
| People | **Team** (hidden until switched on) |
| Organisations (prospective, confirmed, supporting) | **Organisations** |
| Pilot targets / verified results | **Impact statistics** |
| Photographs and videos, alt text, credits | **Media library** |
| Menus, dropdowns, footer link columns | **Navigation & footer** |
| Name, tagline, logo, favicon, colours, SEO, contact details, social links, footer text, newsletter | **Website settings** |
| Messages and applications | **Contact enquiries**, **Applications**, **Newsletter** |

## 12. Content accuracy rules

The seed content follows these rules. Please keep following them as the site evolves:

- ABC is described as a **proposed** youth-led initiative.
- The six-month, two-site **Rwanda pilot is proposed**, not completed, and the sites are not yet established.
- Statistics are **labelled targets** (status "Proposed target", drawn as outlined numbers, with a disclosure note). Use "Achieved" only for recorded results and "Verified" only once they have been checked.
- Species and habitat entries are **educational reference information**, marked as such. Choose "ABC field observation" only for species actually recorded by ABC participants. Never publish precise locations of threatened species.
- No Nature Lab sites, research projects, findings or observations are seeded. Projects are marked **Proposed** until they begin, and Findings stay empty until there are checked results.
- The six potential collaborators are seeded as **prospective and hidden**. The homepage Organisations section shows **confirmed partners only**, so it stays hidden until a partnership exists. Never show an organisation's logo without permission.
- No team members, contact details, registration status, founding date, funding, awards, testimonials or completed projects have been invented. Sections such as Team and contact details stay hidden, or show a neutral placeholder, until real information is entered.
- Review the Privacy Policy with appropriate advice before relying on it.

## 13. Security model

- **The database enforces permissions.** Row Level Security lets anonymous visitors read only published, visible content. Only profiles with `role = 'admin'` can create, update or delete content, manage media or read submissions. New auth users get a profile **without** a role.
- **Every admin page and server action re-checks the administrator role on the server** (`src/lib/auth.ts`). The middleware only refreshes sessions and redirects; hiding links is never the security mechanism.
- **Forms** write only through the `submit_form()` database function, which validates input and rate-limits by a salted SHA-256 hash of the visitor's IP (5 per 15 minutes per visitor, 30 per minute overall). Forms also use a honeypot field and a minimum completion time. Raw IP addresses are never stored.
- **Content sanitising:** rich text is passed through an allow-list sanitiser on save and on render, links are limited to safe schemes (`https`, `mailto`, `tel`, site paths), brand colours must be hex values, and CSV exports neutralise spreadsheet formulas.
- **Community observations** are closed by default. When open, they are stored as "pending" and are invisible until an administrator approves them. Visitors read approved observations only through a database view that leaves out contact details and hides the names of anyone under 18. Only a general area is collected, never a precise location.
- **Activity history** is written by database triggers, so every content change is recorded however it was made. Nobody can edit it.
- **Uploads** go from the browser straight to Supabase Storage. Storage policies allow writes only for administrators, and Supabase enforces file type and size.
- The **service-role key** is only read in server-only modules (`import "server-only"`) and the CLI scripts.
- `/admin` is marked `noindex` and disallowed in `robots.txt`.

## 14. Photographs and credits

The 19 bundled photographs come from Wikimedia Commons under CC BY / CC BY-SA licences. They are stored locally in `public/images/photos/`, resized to 1600 to 2000 px, credited in `public/images/photos/CREDITS.md`, seeded into the media library with their credits, and listed publicly on `/credits`. Hero and page-header photographs also show their credit on the image. When you upload new photographs, fill in the **Credit** and **Source** fields so they appear on the credits page.

If ABC uses its own photographs of participants, especially children, obtain informed consent (and parental consent for minors) first.

## 15. Troubleshooting

| Problem | Fix |
| --- | --- |
| Yellow "Development preview" banner on the live site | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing in the hosting provider's environment variables. Redeploy after adding them. |
| "This account does not have administrator access" | Grant the role (section 7, option B step 2). |
| Admin page error mentioning a missing relation or function | A migration was skipped. Run all files in `supabase/migrations/` in order. |
| Uploads fail with "new row violates row-level security policy" | The `media` bucket policies are missing: re-run migration 3, and make sure you are signed in as an administrator. |
| Password-reset link shows "invalid or expired" | Add `https://YOUR-DOMAIN/admin/auth/callback` to Supabase Redirect URLs and request a new link. |
| Changes do not appear on the site | Saving revalidates pages instantly. If you edited the database directly, wait up to five minutes or redeploy. |
| An admin page says "One database update is needed first" | Run migration 5 (section 16). |
| The Explorer shows species but Admin → Species is empty | The site is showing bundled reference content because migration 5 or the seed has not been run (section 16). |
| The homepage shows photographs, not the 3D landscape | Expected with reduced motion, on low-power devices, in data-saver mode, or after pressing "3D off". Check the footer switch "3D landscape", and **Homepage → Hero → Opening experience**. |
| The observation form says submissions are not open | Switch on **Website settings → Community observations**. |
| Uploaded images from another domain look unoptimised | Only Supabase Storage URLs and local files are optimised by Next.js; others are shown as-is. |

## 16. Upgrading to this version

If your Supabase project was set up before the Biodiversity Explorer was added, do these three things. The website keeps working in the meantime: new sections show bundled reference content, and the admin pages that need the update say so.

1. **Run migration 5.** In Supabase, open **SQL Editor**, paste the contents of `supabase/migrations/20261115000005_explorer_observatory.sql` and press **Run**. It is safe to run more than once.
2. **Load the new content.** On your computer:

   ```bash
   npm run seed -- --force
   ```

   This adds the new pages (Explorer, Citizen Science, Research, Partners), the new menu, habitats, species, proposed citizen science activities and milestones, and updates the homepage. **It overwrites the original starter content**, including the homepage and the starter pages. Anything you created yourself is kept. If you have already rewritten the starter pages and want to keep your wording, skip this step and add the new sections by hand in the CMS instead.
3. **Redeploy** (or wait five minutes for pages to refresh).

"Our Work" is now "Our Approach" at `/our-approach`. The old address `/our-work` continues to work.

## 17. The 3D homepage

The homepage opens with a landscape drawn in the browser. Visitors travel through it as they scroll. It is generated from code (`src/components/experience/`), so there are no 3D model, texture or sound files.

Visitors always have a **Skip to the site** button, a **3D off** button and, if enabled, a **Sound** button. Sound never plays unless a visitor switches it on.

Photographs are shown instead of the landscape when the visitor prefers reduced motion, has switched 3D off, is in data-saver mode, uses a low-power device or a browser without WebGL, or when the device cannot draw it smoothly. Lower-powered devices that can cope get a lighter version.

Administrators control it in **Admin → Homepage → Hero**: text, buttons, theme, chapters, information points, sound, the fallback photographs, and whether 3D is offered at all. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how it works.

## 18. Custom domain

1. Buy a domain from any registrar. This is the one cost the project cannot avoid if you want your own address.
2. **Vercel:** Project → **Settings → Domains** → add the domain and create the DNS records it shows (usually an `A` record for the root domain and a `CNAME` for `www`). **Netlify:** **Domain management → Add a domain** and follow the same pattern.
3. Wait for the certificate to be issued (minutes to a few hours). HTTPS is automatic and free on both.
4. Set `NEXT_PUBLIC_SITE_URL` to the new address in the hosting provider's environment variables and redeploy.
5. In Supabase **Authentication → URL Configuration**, change **Site URL** to the new address and add `https://YOUR-DOMAIN/admin/auth/callback` to **Redirect URLs**.

## 19. Costs and free-tier limits

Everything runs on free tiers. Limits change, so check each provider's current pricing page before relying on these.

| Service | What ABC uses it for | Free-tier points to watch |
| --- | --- | --- |
| **Supabase** | Database, sign-in, image storage | A limited database size and storage allowance. **Free projects are paused after about a week without activity** and must be resumed from the dashboard, so visit the site or dashboard regularly. Built-in email (password resets) is heavily rate limited. |
| **Vercel (Hobby)** | Hosting | Intended for non-commercial use. Monthly limits on bandwidth and image optimisation. |
| **Netlify (Free)** | Hosting (alternative) | Monthly limits on bandwidth and build minutes. |
| **GitHub** | Code | Free for public and private repositories. |
| **Wikimedia Commons** | Photographs | Free. Credits must be kept. |
| **Google Fonts** | Typefaces | Free. Downloaded at build time and served from your own site. |

How the site keeps within them: public pages are pre-rendered and cached, so most visits do not touch the database; the 3D landscape uses no hosted assets; photographs are resized and served in modern formats; the activity history removes entries older than a year.

**Possible recurring costs:** a domain name (the only expected one); a paid Supabase plan if the project should never pause or outgrows the free allowance; a paid hosting plan if traffic grows well beyond the free allowance or the site is used commercially; an email service if password-reset emails need to be reliable (several have free tiers).

No paid APIs, themes, CMS subscriptions, 3D assets or AI services are used.
