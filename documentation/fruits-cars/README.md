# Fruits and Cars reference collection

37 approved Fruits wallpapers form the new Fruits collection. 23 approved Cars wallpapers extend the existing Cars collection from 16 to 39 designs. Each has an individual title and descriptive search keywords.

All artwork is opaque 1080 × 2400 mobile PNG. Local review exports and original master mappings are under `output/fruit-car-review/`; runtime source artwork remains local under `public/wallpapers/scenic/`. The content-hashed Cloudinary delivery mappings are tracked in `src/assets/cloudinaryManifest.js`.

Duplicate references and cards with at least half cut off were excluded. One Lightning McQueen track image was rejected during generation and is not included. `generation.json` records the successful source labels, descriptions and available prompts.

All 60 assets were uploaded with the scoped uploader and published through a revision-checked catalog merge, preserving the 461 existing records and their dates. The uploader dry run reports zero pending. No manual frontend deployment was performed.

Validation: production build, changed-file lint and 15 category/search/catalog tests passed. Focused wallpaper tests pass 31 of 32, with the previously known dense-schedule assertion failing. The broader test invocation stalled and was stopped. No development server was started.
