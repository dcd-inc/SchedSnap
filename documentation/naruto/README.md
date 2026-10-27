# Naruto reference collection

Four designs adapt the four user-provided references in order:

| Reference | Design | ID |
| --- | --- | --- |
| Hidden Leaf profile lineup and Akamaru | Leaf Ink Lineup | `naruto-leaf-ink-lineup` |
| Diagonal retrieval squad | Retrieval Squad | `naruto-retrieval-squad` |
| Sasuke in a plain black T-shirt | Sasuke Quiet Ink | `naruto-sasuke-quiet-ink` |
| Young Kakashi and Obito back to back | Back to Back | `naruto-kakashi-obito` |

Each has separately generated mobile (1080 × 2400), tablet (1600 × 2560), and laptop (1920 × 1080) compositions. Built-in ImageGen was used with the references, followed by placement-only corrections. Fine black contours, solid ink shapes, sparse hatching, and recognizable reference clothing were retained. Portrait compositions reserve the upper timetable area; laptop artwork sits to its right. Export sizing preserves aspect ratio without stretching.

Local PNGs are in `public/wallpapers/scenic/<id>/`. These source assets are ignored by Git; deployed delivery uses `src/assets/cloudinaryManifest.js`. `artwork-manifest.json` records final dimensions, byte sizes, hashes, original generation prompts, placement corrections, and provenance. `schedule-review.json` records sample and dense schedule bounds checked against actual ink bounds.

The Naruto filter also includes the five existing Anime records: Akatsuki Crimson Assembly, Naruto Neon Dojutsu, Naruto Ink Quartet, Crimson Sharingan, and Crimson Manga Eye. Their IDs, artwork, publication dates, and stored records remain intact. Both collections remain available through Anime.

Upload only this inspected set using `node scripts/upload-cloudinary.mjs --artwork-manifest documentation/naruto/artwork-manifest.json` (append `--dry-run` to inspect). `scripts/publish-naruto.mjs` follows the existing reference publisher: review its dry run, then supply `--publish --expect-revision <reviewed-revision>`. It appends missing IDs and preserves existing records.
