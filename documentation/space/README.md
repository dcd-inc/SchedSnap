# Space mobile collection

43 approved reference-based Space wallpapers, generated with built-in ImageGen. Duplicate cards and heavily clipped fragments were excluded. Local master mappings, prompts, numbered review sheets and exports are under `output/space-review/`; `generation.json` records the source provenance.

The mobile PNGs are opaque 1080 × 2400. Runtime originals remain local under `public/wallpapers/scenic/space-*/mobile.png`. `src/assets/spaceTemplates.js` defines individual titles, descriptions, keywords and readable per-design schedule palettes. Every design is mobile-only.

All 43 images were uploaded to Cloudinary, and the scoped uploader dry run reports zero pending. All 43 delivery URLs returned successful image responses. The revision-checked Space publisher added all 43 records and verified schema, collection, keywords and readback, preserving the 531 existing records and dates.

Production build, changed-file lint, and 18 focused catalog/search/image-default tests passed. The full bounded suite reported 370 passing, seven failures and one timeout cancellation. Existing failures concern Cars inventory assumptions, Hunter and dense-schedule layout, tablet style expectations, the omitted Gachiakuta inventory count, and fuzzy search expectations. Removing Space from the search test's input reproduces the same mismatches. The download telemetry test timed out at 30 seconds. No development server was started and no manual frontend deployment was performed.

The source was committed in separate stages for artwork metadata/keywords, catalog integration, the scoped publisher, Cloudinary delivery mappings and release verification notes.
