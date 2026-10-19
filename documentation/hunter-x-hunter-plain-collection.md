# Hunter × Hunter plain character collection

Generated on October 19, 2026 using four sub-agents (three concurrent slots, with the fourth dispatched when a slot became available). The user's approved roster contains 16 mobile-only artworks: Gon and Killua together; the original 13 Phantom Troupe members, including Hisoka; Illumi; and Ging Freecss.

All selected PNGs are opaque, unique, and exactly **1080 × 2400**. Files use `public/wallpapers/scenic/hxh-plain-<character>/mobile.png`. The Gon/Killua image preserves the supplied seated pose, smiles and outfits. Character height varies, leaving roughly the upper half empty. No schedule, lettering or UI is baked into the images.

Following the user's fidelity review, 15 character images were revised using actual anime frames or official NTV model sheets as visual inputs. Corrections include Uvogin's white tank top; Kortopi's black face shadow and single visible eye; all Illumi buttons colored; Chrollo's slicked-back hair; Feitan's V-shaped fringed scarf; Phinks' face and white shoulder yoke; Shizuku's spiky nape and glasses; Pakunoda's bob and suit; Bonolenov's lean build, visible eyes and red gloves; Franklin's scars and overalls; and faithful Nobunaga, Hisoka, Machi, Shalnark and Ging designs. Characters use grayscale with selective irises, signature accents, red gloves and colored buttons. The duo remains unchanged.

`src/assets/hunterTemplates.js` registers the 16 additions in the existing Hunter × Hunter category, bringing that module to 31 designs while preserving the previous 15. New entries include character names, abilities, clothing, colors and aliases for search. Their default schedule position is raised to keep a five-day sample within the empty upper half; users retain appearance and placement controls. Light backgrounds use dark text and dark backgrounds use light text.

## Provenance and deliverables

- `documentation/artwork/hxh-plain-{a,b,c,d}.json`: exact generation prompts, source paths and reference URLs.
- `documentation/artwork/hxh-plain-{a,b,c,d}-revision.json` and `hxh-plain-root-revision.json`: selected corrections, actual image inputs and exact edit prompts. These supersede the first-pass sources.
- `output/hxh-plain/manifest.json`: dimensions, opacity verification, SHA256 checksums and palettes.
- `output/hxh-plain/collection-contact.jpg`: labeled final collection contact sheet.
- `output/hxh-plain/hunter-x-hunter-plain-mobile.zip`: all 16 full-size PNGs.
- `output/hxh-plain/review.html`: browser review harness with sample and dense schedules.

Built-in image generation was used separately for each artwork, including visual revisions. Pillow performed final dimension normalization, inspection and contact-sheet packaging; it did not paint or alter the illustrations. Cloudinary uploads use the existing scoped, content-hashed uploader. Source assets and the ZIP remain local under the repository's existing ignore rules; immutable uploaded image metadata is recorded in `src/assets/cloudinaryManifest.js`.

## Validation and delivery

All 16 selected images were visually inspected for identity, plain background, selective color and absence of text. Exact dimensions, opacity and unique file checksums pass. Palette text contrast is at least 4.5:1. The six Hunter tests pass, including schema, search, inventory, uploads and gallery/export placement. The browser rendered 32 actual Canvas previews (16 with five meetings and 16 with ten meetings), without page errors. Their schedule bottoms stay at or above y=1191, with individual raised placement for taller portraits. Very dense schedules or user changes can extend below this reserved sample area. Browser review uses filesystem-backed request interception because the sandboxed development server was unreachable from the browser; actual renderer modules, local artwork and bundled font were used.

All 16 assets were uploaded; 15 revised images received new immutable uploads. The original 15 Hunter designs and their dates remain intact. The full test suite reports 266 passing and one pre-existing failure caused by missing `public/wallpapers/scenic/anime-akatsuki-crimson-assembly/mobile.png`. Shared catalog publication and frontend deployment have not been performed. The new designs are registered in the local Hunter × Hunter preview catalog for review.

Final verification: scoped upload dry run reports zero pending of 16; changed-file ESLint and production build pass. The development server was stopped. No shared catalog records were written and no frontend deployment was performed.
