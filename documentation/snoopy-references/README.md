# Snoopy reference additions

| User reference | Design | ID |
| --- | --- | --- |
| Snoopy resting on his back | Lazy Afternoon | `snoopy-lazy-afternoon` |
| Snoopy beside a daisy | Daisy Pause | `snoopy-daisy-pause` |
| Snoopy with headphones, Woodstock, and a cassette player | Cassette Days | `snoopy-cassette-days` |

Built-in ImageGen produced separate mobile (1080 × 2400), tablet (1600 × 2560), and laptop (1920 × 1080) compositions for each reference. The drawings preserve the references' simple, uneven black pen contours, white ground, minimal facial details, and recognizable poses/accessories. The upper portrait area and left laptop area remain clear for Canvas timetables. Final sizing preserves aspect ratio without stretching.

Source PNGs live in `public/wallpapers/scenic/<id>/` and are ignored by Git. Runtime delivery uses `src/assets/cloudinaryManifest.js`. `artwork-manifest.json` records prompts, source provenance, final dimensions, byte sizes, hashes, and ink bounds. `schedule-review.json` records 18 Chrome Canvas renders using the actual app font and renderer: sample and 15-meeting schedules on all nine backgrounds, without overflow or artwork overlap.

Definitions are in `src/assets/snoopyReferenceTemplates.js`, included in the existing Snoopy collection through `snoopyTemplates.js`. Existing designs and publication dates are preserved.

Scoped upload: `node scripts/upload-cloudinary.mjs --artwork-manifest documentation/snoopy-references/artwork-manifest.json` (append `--dry-run` to inspect). Catalog publication: review `node scripts/publish-snoopy-references.mjs`, then use `--publish --expect-revision <reviewed-revision>`. The publisher appends only missing IDs.
