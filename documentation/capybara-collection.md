# Capybara mobile collection

Five reference-inspired wallpapers approved in chat on 2026-10-18. Generated with built-in Imagegen; exact prompts and original filenames are in `capybara-mobile-previews-20261018.json`.

Approved 841 × 1870 previews were normalized with Pillow Lanczos to opaque RGB 1080 × 2400 PNGs without changing their compositions. Original previews remain in `output/artwork-samples/capybara-20261018/`. Production sources remain local under `public/wallpapers/scenic/capybara-*/mobile.png`; immutable Cloudinary delivery metadata is committed in `src/assets/cloudinaryManifest.js`.

Titles: Capybara Peace, Capybara Head Tilt, Capybara Peek, Capybara Daisy Day, Capybara Strawberry Hood. Each has explicit character, palette, expression, motif, medium, and mobile wallpaper keywords. The Capybara gallery collection is mobile-only. Schedule colors match each background and the gallery retains the preset's vertical placement.

Uploaded five assets and verified zero pending uploads with `scripts/upload-cloudinary.mjs --artwork-manifest output/capybara/manifest.json --dry-run`. Published all five to the live catalog using `scripts/publish-capybara-templates.mjs --publish --expect-revision <reviewed-revision>`; verified readback and preserved all 209 prior records and dates.

Validation: production build, lint on changed JavaScript, all tests in `tests/*.test.js`, schema/keyword/Cloudinary dimensions, and Canvas geometry checks for gallery/export consistency and complete dense schedules. Broad `npm test` also discovers incomplete scratch backups under `output/`; use the bounded project test folder. Dense schedules can extend over the illustration; users can adjust their layout/appearance. No browser visual review was performed for the integrated schedule overlays.
