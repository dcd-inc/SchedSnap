# Additional Naruto references

| User reference | Design | ID |
| --- | --- | --- |
| Naruto in a dark zip jacket | Resolute Ink | `naruto-resolute-ink` |
| Sasuke with sword and hatched shadow | Sasuke Shadow | `naruto-sasuke-shadow` |
| Panoramic Sharingan eye close-up | Sharingan Gaze | `naruto-sharingan-gaze` |
| Itachi in his high cloak collar | Itachi Stillness | `naruto-itachi-stillness` |
| Minato’s Fourth Hokage cloak | Fourth Hokage | `naruto-fourth-hokage` |

Built-in ImageGen creates separate mobile (1080 × 2400), tablet (1600 × 2560), and laptop (1920 × 1080) compositions. Artwork follows each reference's ink contours, dark fill shapes, hatching, character proportions, and accessories. The eye close-up remains panoramic. Minato's cloak retains vertical `四代目火影` lettering and its original flame motif and screentone. Portrait artwork occupies the footer; laptop artwork sits to the right of the timetable.

Final PNGs are saved locally in `public/wallpapers/scenic/<id>/` (ignored by Git). Deployment uses the uploaded entries in `src/assets/cloudinaryManifest.js`. `artwork-manifest.json` records exact generation prompts, provenance, final dimensions, byte sizes, hashes, and ink bounds. `schedule-review.json` records browser Canvas verification with sample and 15-meeting schedules on all 15 backgrounds.

The five templates in `src/assets/narutoExtraTemplates.js` join `narutoTemplates.js` and the existing Naruto category. Existing templates and their creation/publication dates are preserved; Anime continues to include Naruto.

## Edge-aligned revision

The user requested larger artwork that meets the canvas edges instead of floating above a visible torso crop. Resolute Ink now meets the bottom-left corner on every device; its laptop timetable moves to the right. The other four compositions meet the bottom-right corner. Minato uses the existing `artworkFooter` flag to reserve a taller tablet footer while retaining every meeting. Size is checked against the previous artwork in the local `output/naruto-edge-layout-review.json` report, and schedule clearance is checked again with sample and dense schedules.

After uploading the revised sources, `scripts/revise-naruto-artwork.mjs` updates only the five existing records' image URLs, schedule positions, and the explicit protected-footer setting. It preserves IDs, other administrator metadata, visibility, creation/publication dates, and all unrelated records. Review the dry run before passing `--publish --expect-revision <reviewed-revision>`. Local review/result reports under `output/` retain previous and replacement delivery URLs. Old Cloudinary images are retained.

Scoped upload: `node scripts/upload-cloudinary.mjs --artwork-manifest documentation/naruto-extra/artwork-manifest.json` (append `--dry-run` to inspect). Use the existing `scripts/publish-naruto.mjs` to review missing records, then supply `--publish --expect-revision <reviewed-revision>`. It appends only missing IDs and checks the catalog again before writing.
