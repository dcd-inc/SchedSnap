# Anime reference collection

Fifteen opaque mobile PNGs, one per supplied reference, generated with built-in ImageGen by four sub-agents. The session supports three simultaneous children, so the fourth started when the first slot became available.

Final artwork: `public/wallpapers/scenic/anime-*/mobile.png`, exactly 1080 × 2400. User authorized local Lanczos resizing with aspect-preserving edge cropping. Raw source paths and exact generation prompts are recorded in `prompts-and-sources.json`; the part files retain each agent's original generation report before normalization.

Templates are in `src/assets/animeTemplates.js`. Reference 4 belongs to Hunter × Hunter; the other fourteen belong to Anime. Search keywords include series, characters, colors and composition where identifiable. Solid schedule containers protect class readability while retaining the requested artwork compositions.

Verification: 15 distinct hashes, opaque PNGs, exact dimensions, schema validation, 30 actual Canvas schedule previews (sample and dense), visual contact-sheet review, 253 passing tests, lint and production build. Review files and the upload manifest are under `output/anime-collection/`.

All 15 images were uploaded to Cloudinary and all 15 templates published to the live catalog, preserving its 214 existing records. The uploader dry run reports zero pending. Frontend deployment was not performed; the new Anime collection matching and admin collection option require deploying this source revision.

The artwork files follow the repository's existing ignored-originals policy; Cloudinary delivery metadata and template definitions are tracked source. No existing designs were replaced or deleted.

Brightness update: the original fifteen templates now use the renderer's existing `rgba(0,0,0,0.2)` overlay, yielding exactly 80% background brightness without changing source pixels or schedule colors. The same overlay was published to their live catalog records, preserving all other template fields and publication dates. `scripts/dim-anime-templates.mjs` scopes updates using the original provenance IDs, checks catalog revisions, backs up the previous catalog locally, and verifies saved records. Verification: 265 tests pass, lint and build pass, 30 schedule previews rendered; see `output/anime-collection/brightness80-schedule-review.jpg`.
