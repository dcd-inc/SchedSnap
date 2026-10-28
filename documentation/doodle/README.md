# Doodle collection

Twenty approved reference-based mobile wallpapers generated with built-in ImageGen. `generation.json` records the prompt and source mapping in reference order. The blank attachment was excluded.

Originals and 1080 × 2400 portrait exports remain under `output/doodle-review/`; runtime artwork is in `public/wallpapers/scenic/doodle-*/mobile.png` and delivered through immutable Cloudinary URLs. `src/assets/doodleTemplates.js` defines the titles, individual keywords and mobile-only appearance presets.

All twenty images are uploaded and all twenty catalog entries published. Readback confirmed unique records, titles, collection and keyword metadata; every image returned HTTP 200 with PNG content and CORS access. The scoped uploader reports zero pending. Existing catalog records were preserved.

Production build, relevant lint and 28 related admin/category tests pass. Full tests report 361 passing and four failures; see the local `output/doodle-review/full-tests.log`. No development server was started.
