# Capybara collection: 22 approved additions

All 22 numbered previews were approved on 2026-10-19. The collection now has 27 mobile designs including the original five. Exact generation prompts, reference mapping, filenames, production paths and SHA256 checksums are recorded in `capybara-mobile-previews-20261019.json`.

Every uploaded asset is an opaque RGB PNG at exactly **1080 × 2400** (9:20 portrait). `scripts/prepare-capybara-wave2.py` uses uniform Lanczos scaling to preserve proportions. Previews 18 and 22 were wider than 9:20, so only their empty blue upper field was extended; no character was stretched or cropped. Other previews lose at most two empty top-edge pixels due to rounding. All 22 files have unique hashes. The two extended compositions were visually inspected.

Each design includes a title, a concise description, character/expression/accessory/color keywords, the existing blue Capybara schedule theme, and a mobile-only background. Existing five design dates are unchanged. Cloudinary originals remain local; immutable public metadata lives in `src/assets/cloudinaryManifest.js`.

The scoped uploader verified zero pending assets after uploading all 22. The publisher added all 22 and verified catalog readback while preserving all 229 existing records and dates.

Validation: Capybara schema, discovery, immutable image metadata, exact sizing, sample/dense schedule geometry and gallery/export consistency pass. Production build and changed-file lint pass. Full project tests: 265 pass, one unrelated anime fixture test fails because `public/wallpapers/scenic/anime-akatsuki-crimson-assembly/mobile.png` is absent. No live browser visual check of schedule overlays was performed; dense schedules may overlap footer artwork, as with the existing collection.
