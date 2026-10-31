# SchedSnap

Turn your class schedule into a wallpaper. SchedSnap lets students choose a design, add classes, customize the layout, and download a PNG for their device.

## Features

- Browse wallpaper collections for mobile, tablet, and laptop.
- Choose a template or upload your own background.
- Import classes from a registration-form image with AI, enter them manually, or try sample data.
- Review course codes, subjects, meeting days, times, and rooms before exporting.
- Customize the wallpaper title, fonts, colors, schedule placement, and day containers.
- Preview and download a Canvas-rendered PNG, with validation for invalid details or schedules that do not fit.
- Restore class and title drafts from per-tab browser session storage.

Student accounts are not required. Uploaded registration images are sent to the configured AI provider for analysis; API credentials stay on the server. Optional PostHog analytics run only after the visitor accepts analytics cookies.

## Local development

Requires **Node.js 22.12 or newer** and **npm**.

```sh
npm install
```

Copy `.env.example` to `.env.local`, then configure the integrations you need. Manual class entry works without AI credentials.

```sh
npm run dev
```

Open the local URL printed by Vite. This command serves both the frontend and the local API adapter. Keep the server in the foreground and stop it with **Ctrl+C** when finished.

To use the Vercel development runtime instead, run `npm run dev:full`; this may require Vercel login and project linking.

### Environment configuration

See [`.env.example`](.env.example) for all supported settings and defaults. Never commit real credentials. Only variables prefixed with `VITE_` are public; keep secrets server-only. Restart development or redeploy after changing environment values.

| Integration | Variables | Purpose |
| --- | --- | --- |
| Gemini | `GEMINI_API_KEYS`, `GEMINI_MODEL` | Extract classes from registration images. Separate multiple keys with commas. |
| DeepSeek | `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL` | Optional fallback when Gemini fails or returns invalid output. |
| Upstash Redis | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `IMPORT_LIMIT_SECRET` | Shared import allowances and design voting. Required for production AI imports. Keep the secret stable between deployments. |
| Import allowance | `IMPORT_DAILY_LIMIT` | Defaults to 15 attempts per public IP per Philippine calendar day. Failed analyses refund their reserved attempt; manual entry is unlimited. |
| Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Artwork uploads and catalog administration. |
| Admin | `ADMIN_PASSWORD`, optional `ADMIN_SESSION_SECRET` | Protect design management at `/admin`. Follow the [admin setup guide](documentation/ADMIN.md) before enabling production login. |
| Analytics | `VITE_POSTHOG_TOKEN`, `VITE_POSTHOG_HOST` | Optional browser analytics after consent. Use a public project token. |
| Pageview totals | `POSTHOG_PROJECT_ID`, `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_API_HOST` | Optional server-side aggregate pageview query. Use a private personal API key. |

Without Redis configuration, local development uses in-memory allowances and votes that reset when the server restarts. Production AI imports are blocked when allowance storage is unavailable. People sharing a public IP share the daily import allowance.

### Checks and build

```sh
npm run lint
npm test
npm run build
node scripts/check-seo.mjs
```

`npm run preview` serves the built frontend locally. Use `npm run dev` or `npm run dev:full` when testing server API behavior.

## Project structure

```text
api/             Vercel API handlers
server/          Server-side integrations and storage
shared/          Shared schemas and application rules
src/             React pages, components, artwork metadata, and Canvas rendering
public/          Static delivery assets
scripts/         Build, SEO, artwork, and administration tools
tests/           Node test runner suites and fixtures
documentation/   Setup guides, audits, and artwork provenance
```

Built with React, Vite, Tailwind CSS, React Router, HTML5 Canvas, and Vercel Node.js functions. AI extraction uses Gemini with an optional DeepSeek fallback. Cloudinary delivers artwork; Upstash Redis supports shared counters and voting.

## Deployment and artwork

Deploy to Vercel and configure the required server environment variables there. The production build prerenders public content and generates page metadata, `sitemap.xml`, and `robots.txt`. See the [SEO guide](documentation/SEO.md) for details.

Wallpaper originals and mascot master folders stay local and are excluded from Git and deployment output. After uploading artwork to Cloudinary, commit the template metadata and `src/assets/cloudinaryManifest.js`. Keep landing-page delivery images, icons, and fonts in Git. Use the [artwork workflow](documentation/skills/schedsnap-artwork/SKILL.md) and [asset inventory](documentation/IMAGE_ASSETS.md) when updating designs.

## Documentation

- [Product behavior](PRODUCT.md)
- [Design system](DESIGN.md)
- [Technical setup and extension guide](documentation/TECH_STACK.md)
- [Design administration](documentation/ADMIN.md)
- [Cloudinary setup](documentation/CLOUDINARY.md)
- [Redis usage and storage behavior](documentation/REDIS_USAGE.md)
- [PostHog analytics](documentation/posthog/README.md)
- [Pageview totals](documentation/VISIT_COUNTER.md)
- [Wallpaper templates and artwork provenance](documentation/WALLPAPER_TEMPLATES.md)
- [Device showcases](documentation/DEVICE_SHOWCASES.md)
- [Search visibility](documentation/SEO.md)

Some design notes and audit reports describe earlier versions. For current commands and environment defaults, use `package.json` and `.env.example`.
