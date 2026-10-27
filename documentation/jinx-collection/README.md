# Arcane collection

Eleven approved mobile backgrounds: the first four Jinx designs and seven selected designs from the second preview batch. Zaun Rooftops and the three warm mural previews are excluded.

The second selection contains Gilded Divide, Sisters in Ink, Piltover Blue, Goggle Girl, Chalk Mischief, Violet Tear, and Paper Peek. Each preset has character, palette, material, and motif keywords. All designs use the `arcane` collection, the existing protected illustration-footer layout, and light/dark schedule palettes. Student details are rendered separately.

Artwork is resized to 1080 × 2400 without cropping or repainting. Source and SHA-256 records are in `artwork.json` and `approved-seven.json`. Local PNG originals are ignored by Git; public delivery URLs and dimensions are committed in `src/assets/cloudinaryManifest.js`.

Upload a verified manifest with `node scripts/upload-cloudinary.mjs --artwork-manifest documentation/jinx-collection/approved-seven.json`. Review additions with `node scripts/publish-jinx-templates.mjs`, then publish with `--publish --expect-revision <reviewed-revision>`. The publisher only adds absent approved IDs, validates uploaded assets, backs up the catalog locally, checks the revision, preserves existing records/categories, and verifies the saved result.

Validation: production build, focused catalog/category/keyword tests, lint, preset schema and uploaded dimensions, keyword lookup, and sample schedule fitting. Automated visual capture was unavailable because the installed headless browser failed to launch.
