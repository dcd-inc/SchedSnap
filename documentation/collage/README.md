# Collage mobile collection

Thirty user-approved, reference-based wallpapers generated with built-in ImageGen: ten initial designs and two later batches of ten. Exact generation prompts are in `prompts-01-06.json`, `prompts-07-10.json`, `prompts-11-20.json` and `prompts-21-30.json`. The last batch includes two distinct compositions from the duplicated red-grunge reference.

Generated originals are preserved in the `masters/` folders under `output/dark-collage-mobile-review/`, `output/collage-wave2-review/` and `output/collage-wave3-review/`. Most masters are 841 × 1870; Chrome Kiss is 819 × 1920 and receives a minimal center crop when exported. Technical resampled opaque 1080 × 2400 exports are in `public/wallpapers/scenic/collage-*/mobile.png`. No tablet or laptop compositions were requested; every preset is mobile-only.

`src/assets/collageTemplates.js` defines individual titles, descriptions, search keywords and schedule appearance. The Collage collection is registered in the gallery and admin schema. Existing catalog records and their timestamps were preserved during revision-checked publication.

All thirty images were uploaded with the existing scoped Cloudinary uploader. The follow-up dry run reports zero pending for the twenty additions. All thirty catalog entries are published, and all thirty Cloudinary URLs returned HTTP 200 with PNG content and CORS access. Public URLs and published keywords are recorded in `output/dark-collage-mobile-review/published.json`. The original ten entries and all unrelated catalog records retain their existing dates and content.

Validation: production build and relevant ESLint checks pass; 332 of 334 tests in `tests/` pass. The remaining two failures concern existing Hunter dense-schedule overflow behavior. All Collage schema, inventory, keyword search, upload and related admin/category checks pass. The bare `npm test` command also discovers stale test copies in output/tmp directories. No development server was started.

Cloudinary upload and catalog publication are complete. The initial Collage filter was committed and pushed in `74fcf8c`; this extension adds twenty presets without changing gallery behavior. No separate manual frontend deployment was performed.
