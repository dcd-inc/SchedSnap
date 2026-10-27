# Collage mobile collection

Ten user-approved, reference-based wallpapers generated with built-in ImageGen: six from the first reference set and four from the second. Exact generation prompts are in `prompts-01-06.json` and `prompts-07-10.json`.

Generated originals are 841 × 1870 PNGs, preserved in `output/dark-collage-mobile-review/masters/`. Technical resampled opaque 1080 × 2400 exports are in `public/wallpapers/scenic/collage-*/mobile.png`. No tablet or laptop compositions were requested; every preset is mobile-only.

`src/assets/collageTemplates.js` defines individual titles, descriptions, search keywords and schedule appearance. The Collage collection is registered in the gallery and admin schema. Existing catalog records and their timestamps were preserved during revision-checked publication.

All ten images were uploaded with the existing scoped Cloudinary uploader. The follow-up dry run reports zero pending. All ten catalog entries are published, and all ten Cloudinary URLs returned HTTP 200 with PNG content and CORS access. Public URLs and published keywords are recorded in `output/dark-collage-mobile-review/published.json`.

Validation: production build and relevant ESLint checks pass; 332 of 334 tests in `tests/` pass. The remaining two failures concern existing Hunter dense-schedule overflow behavior; all ten Collage sample schedules fit. The bare `npm test` command also discovers stale test copies in output/tmp directories. No development server was started.

Cloudinary upload and catalog publication are complete. The frontend Collage filter is implemented locally; no frontend deployment was performed in this task.
