# Transformers wallpaper collection

Five explicitly approved mobile designs: Golden Visor, Stellar Frontline, Scarlet Command, Sunlit Vanguard, and Steel and Scarlet. All six later previews are rejected and excluded.

Each design belongs to Transformers and has individual character, color, style, and motif keywords. Artwork preserves the complete approved composition, resized to 1080 x 2400 without cropping or repainting; the shared renderer supplies the schedule. Original approval sources and checksums are recorded in the manifests. Large original files remain local; Git stores presets and public Cloudinary metadata.

Upload with `node scripts/upload-cloudinary.mjs --artwork-manifest documentation/transformers/upload-manifest.json`. Review `node scripts/publish-transformers-templates.mjs`, then publish using `--publish --expect-revision <reviewed revision>`; the publisher preserves existing records and verifies saved data.

Validation: production build, focused lint, 15 catalog/category/keyword tests, five preset schemas, unique IDs, exact artwork dimensions, Cloudinary mappings, name searches, and sample schedule fitting passed.
