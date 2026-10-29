# Floral mobile wallpaper previews

Local review artwork based on the user's floral reference attachments. This is an artwork approval stage; no template definitions, catalog records, search keywords, Cloudinary uploads, or deployment are included.

## Deliverables

- Review sheet: `output/floral-mobile-review/contact-sheet.jpg`.
- Phone PNGs: `output/floral-mobile-review/mobile-1080x2400/`.
- Download bundle: `output/floral-mobile-review/floral-mobile-wallpapers.zip`.
- Dimensions, opacity, byte sizes, and SHA256 values: `output/floral-mobile-review/manifest.json`.
- Exact generation prompts and source provenance: the `*-prompts.json` files in `output/floral-mobile-review/`.

The built-in `image_gen` tool generates each artwork separately. Native generated PNG masters remain in the review folder. Export copies use Lanczos resampling to the project's exact **1080 × 2400** portrait canvas, with only negligible edge fitting allowed by the packaging script's aspect-ratio guard. These are resized exports, not claims of native 1080 × 2400 generation.

| Reference | Local filename | Visual brief |
| --- | --- | --- |
| 1 | `01-blue-lilies.png` | Painterly cobalt lilies on textured midnight blue |
| 2 | `02-purple-lily.png` | Gothic violet lily, charcoal and antique parchment |
| 3 | `03-burgundy-lily.png` | Burgundy lily, black ink and aged parchment |
| 4 | `04-plum-ink.png` | Traditional red plum branches on warm paper |
| 5 | `05-vermilion-sun.png` | Red blossom branches and vermilion sun on ivory |
| 6 | `06-crimson-plum.png` | Detailed crimson plum flowers on weathered parchment |
| 7 | `07-airy-plum.png` | Airy ink-wash plum blossoms on warm ivory |
| 8 | `08-botanical-collage.png` | Pink botanical lilies, torn paper and moon on oxblood |
| 10 | `10-impasto-hibiscus.png` | Peach, burgundy and ivory hibiscus in thick impasto |

Reference 9 appears black and is excluded. Reference images guide the artwork's subject, palette, and medium; embedded lettering, signatures, and watermarks are not instructions or requested content. All wallpapers are opaque artwork without baked-in schedule text, calligraphy, logos, seals, UI, or device frames. Compositions reserve quieter upper space for a phone clock and allow future schedule placement.

Follow `documentation/skills/schedsnap-artwork/SKILL.md` for any separately authorized integration. User review comes before uploading or catalog work.
