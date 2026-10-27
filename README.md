# Arabi Hamza — Portfolio v2

<p align="center">
  <img src="./public/og-image.jpg" alt="Hamza Portfolio preview" width="720">
</p>

Personal portfolio of **Arabi Hamza**, full-stack web developer based in morocco
(React · Laravel · PHP · MySQL · MongoDB), currently at Delta Holding, Rabat.

**Live site:** https://Hamzaarabi.github.io/portfolio/

## ✨ Highlights

- **Ground-up rebuild** — migrated from Create React App (deprecated) to **Vite 6 + React 19**
- **Custom design system** — Space Grotesk + Inter, emerald aurora gradients, glass cards
- **Dark / light themes** — persisted, respects `prefers-color-scheme`, no flash on load
- **⌘K command palette** — quick navigation, copy email, download CV, theme switch
- **Three languages** — English, Français and العربية with a persistent navbar switcher, translated portfolio content, Arabic RTL layout and Arabic fonts
- **Portfolio chatbot** — trilingual smart FAQ assistant for services, projects, skills, hiring, CV and WhatsApp contact; its Ask AI button sits above WhatsApp on the bottom-right
- **Supabase Admin area (`/#/admin`)** — real Supabase Auth + Postgres/RLS/Realtime/Storage; manage skills, projects, experience, EmailJS settings and contact messages for every visitor
- **Project case studies** — filter + search, WebP galleries with keyboard-accessible lightbox, prev/next navigation
- **Animated experience** — typewriter hero, counting stats, scroll-reveal sections, animated skill bars, marquee
- **Performance** — 68 images converted PNG → WebP (**~22 MB → 2.6 MB**), route-level code splitting, lazy images; total build ≈ 3.2 MB
- **SEO ready** — meta/OG/Twitter tags, JSON-LD `Person` schema, `sitemap.xml`, `robots.txt`, semantic HTML, per-page titles
- **Accessible** — skip link, ARIA labels, focus states, `prefers-reduced-motion` support, labelled form with validation
- **Working contact form** — saves to a private Supabase inbox and sends through EmailJS, with validation and honeypot anti-spam
- **Legacy-proof** — old v1 routes (`/AboutMe`, `/Projects`…) redirect to the new ones

## 🛠 Tech stack

| Area | Tools |
| --- | --- |
| Framework | React 19, React Router 7 |
| Build | Vite 6 |
| Styling | Hand-written CSS design system (no framework) |
| Icons | react-icons |
| Backend | Supabase Postgres, Auth, Row Level Security, Realtime and Storage |
| Forms | Supabase contact inbox + EmailJS delivery |
| Hosting | GitHub Pages (Actions) · Vercel-ready |

## 🚀 Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (HMR) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build + publish to GitHub Pages via `gh-pages` |

## ✏️ Editing content

The seed/fallback copy lives in [`src/data/portfolio.js`](src/data/portfolio.js). Once the
Supabase migration is applied, Admin-managed skills, projects, work experience,
EmailJS settings and contact messages come from Supabase and update every visitor
without a redeploy. Profile/services/education/FAQ copy remains versioned in code.
Project screenshots bundled with the site stay in `src/assets/webp/projectN/`; new
Admin cover uploads go to the Supabase Storage bucket `portfolio-media`.

### Languages (English / Français / العربية)

Use the language selector in the navbar. The choice is saved in `localStorage`; on a first
visit, the browser language is used when it is English, French or Arabic. UI copy lives in
`src/i18n/translations.js`, while French/Arabic versions of the built-in portfolio content
live in `src/i18n/localizeContent.js`. Arabic switches the document to RTL. Custom skills,
projects and experience created in Admin keep the text entered by the owner.

### Supabase backend + Admin area (`/#/admin`)

The Supabase project is `edplthwtzxdrqitdupvi`. The browser uses only the
**publishable** key from `src/lib/supabase.js` (or `VITE_SUPABASE_PUBLISHABLE_KEY`);
never put a Supabase secret/service-role key or an EmailJS private key in front-end code.

Database objects are versioned in
[`supabase/migrations/20261027153000_create_portfolio_backend.sql`](supabase/migrations/20261027153000_create_portfolio_backend.sql):

- `portfolio_skill_groups` and `portfolio_skills`
- `portfolio_projects` (including draft/published state)
- `portfolio_experience`
- `site_settings` (EmailJS Service ID, Template ID and Public Key)
- `contact_messages` (public insert only; admin-only inbox)
- public Storage bucket `portfolio-media` for Admin project-cover uploads
- RLS: everyone can read published content; only the authenticated owner
  (`arabihamzaaa@gmail.com`, or app role `admin`) can write/read messages.

#### First-time production setup

1. In Supabase Dashboard → **Project Settings → Integrations → GitHub**, keep this
   repository connected, set the production branch to `main`, and enable
   **Deploy to production**. Merging the migration to `main` then applies it and
   seeds the current portfolio. If that option is off, paste/run the migration SQL
   once in **SQL Editor** instead.
2. In **Authentication → Users**, create and confirm the owner user
   `arabihamzaaa@gmail.com` with a strong password. There is intentionally no public
   sign-up form in Admin.
3. In **Authentication → Providers/Settings**, disable public email sign-ups after
   creating the owner (the RLS admin check is still enforced either way).
4. Open `/#/admin` directly by URL (it is intentionally not linked publicly), sign in,
   and check **Backup / Data → Supabase status** says live.
5. If the old browser-local Admin had changes, use **Migrate old local data** once,
   verify the public site, then clear the local copy.

From Admin you can now, for every visitor and from any device:

- add/edit/delete **skills** and skill groups
- add/edit/delete/publish/unpublish **projects**, including Supabase Storage cover uploads
- reorder and fully edit **work experience**
- read/reply/status/delete **contact messages** saved from the Contact form
- configure **EmailJS**, send a test email, or reset it to code defaults
- export/import Supabase content as version-2 JSON (older local backups also import)

- Replace the résumé by overwriting `public/Hamza-CV.pdf`
- Optional: copy `.env.example` → `.env` to point a preview/fork at another Supabase
  project or override EmailJS fallbacks at build time.

## 📦 Deployment

- **GitHub Pages** — every push to `main` builds in CI and publishes the result to the
  `gh-pages` branch via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
  Keep *Settings → Pages → Build and deployment* on **"Deploy from a branch: `gh-pages` / (root)"**.
  You can also publish manually anytime with `npm run deploy` (same destination).
- **Vercel** — import the repo; [`vercel.json`](vercel.json) already contains the
  build settings, SPA rewrites, security headers and immutable asset caching.

## 📁 Structure

```
src/
  data/portfolio.js     ← published default content
  i18n/                 ← English/French/Arabic translations + content localization
  lib/supabase.js       ← browser Supabase client (publishable key only)
  content/              ← Supabase content provider, realtime sync + legacy-local migration
  pages/                ← Home, About, Services, Skills, Projects(+Details), Contact, Admin, 404
  sections/             ← Hero, About, Services, Projects, Skills, Journey, Extras
  components/           ← Navbar, Footer, CommandPalette, ChatBot, Lightbox, ProjectCard…
  hooks/                ← typewriter, counters, theme, page titles
  styles/index.css      ← the whole design system
  assets/webp/          ← optimised project imagery
public/                 ← CV, favicon, OG image, manifest, robots, sitemap
supabase/migrations/    ← Postgres schema, RLS policies, Storage bucket and seed
```

## 📜 v1 → v2 changelog

Removed: Create React App, jQuery, Bootstrap CDN, react-slick, duplicated EmailJS package,
the 3-second fake loader, Hotjar, ~40 scattered CSS files and placeholder copy.
Fixed along the way: broken "next project" on the last case study, duplicated SEO bullets,
wrong WordPress description, stale copyright year, unlabelled form fields, and links that
broke under hash routing.
