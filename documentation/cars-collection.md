# Cars mobile catalog

All 16 generated wallpapers were approved for upload and publication on 2026-10-27. Both the original compositions and the reference edits are retained.

## Delivery

- Collection/category: `cars` / Cars.
- All 16 opaque 1080 × 2400 PNGs are uploaded to the configured Cloudinary account.
- All 16 published catalog records were read back and validated, including keywords, mobile-only flags, and the Cars category.
- Existing catalog records and dates were preserved. Publication backup: `output/car-wallpaper-all-review/catalog-before-publication.json`.
- A repeat scoped upload dry run reports zero pending files; a repeat publisher run reports zero additions.
- Frontend source and production build are updated locally; no frontend deployment was run.

## Designs and keywords

| Review number | Title | ID | Keywords |
| --- | --- | --- | --- |
| 1 | Porsche · Blush Hibiscus | cars-blush-hibiscus | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, pink, blush, hibiscus, flowers, floral, pastel, wallpaper, Porsche · Blush Hibiscus, original |
| 2 | Porsche · Oxblood Hibiscus | cars-oxblood-hibiscus | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, burgundy, oxblood, red, hibiscus, flowers, floral, wallpaper, Porsche · Oxblood Hibiscus, original |
| 3 | Porsche · Crimson GT3 | cars-crimson-gt3 | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, GT3, cherry, crimson, red, rear wing, paper texture, wallpaper, Porsche · Crimson GT3, original |
| 4 | Ferrari · Scarlet Hibiscus | cars-scarlet-hibiscus | cars, car, automotive, sports car, mobile, phone wallpaper, Ferrari, supercar, red, scarlet, ivory, cream, hibiscus, flowers, floral, wallpaper, beige, Ferrari · Scarlet Hibiscus, original |
| 5 | Porsche · Champagne Lily | cars-champagne-lily | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, champagne, beige, cream, white, lily, flowers, floral, wallpaper, Porsche · Champagne Lily, original |
| 6 | Porsche · Ice Blue Lily | cars-ice-blue-lily | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, blue, white, powder blue, lily, flowers, floral, blue wheels, wallpaper, Porsche · Ice Blue Lily, original |
| 7 | McLaren · Carbon Shadow | cars-carbon-shadow | cars, car, automotive, sports car, mobile, phone wallpaper, McLaren, black, charcoal, silver, carbon fiber, supercar, dark, cinematic, wallpaper, gray, grey, McLaren · Carbon Shadow, original |
| 8 | Porsche · Graphite Rain | cars-graphite-rain | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, GT3 RS, graphite, black, silver, rain, droplets, dark, wallpaper, gray, grey, rainy, umbrella, Porsche · Graphite Rain, original |
| 9 | Porsche · Pink Lettering | cars-pink-type | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, pink, blush, taupe, typography, serif, cursive, rear wing, wallpaper, Porsche · Pink Lettering, reference |
| 10 | Porsche · Burgundy Lettering | cars-burgundy-type | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, burgundy, oxblood, red, typography, script, widebody, classic, wallpaper, black, dark, white, Porsche · Burgundy Lettering, reference |
| 11 | Porsche · Crimson Lettering | cars-crimson-type | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, GT3, crimson, red, black, typography, cursive, rear wing, wallpaper, dark, Porsche · Crimson Lettering, reference |
| 12 | Ferrari · Ivory Lettering | cars-scarlet-ivory-type | cars, car, automotive, sports car, mobile, phone wallpaper, Ferrari, Porsche lettering, supercar, scarlet, red, ivory, cream, typography, bow, wallpaper, beige, bows, ribbons, Ferrari · Ivory Lettering, reference |
| 13 | Porsche · Champagne Lettering | cars-champagne-type | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, champagne, beige, cream, taupe, typography, serif, rear wing, wallpaper, Porsche · Champagne Lettering, reference |
| 14 | Porsche · Blue Lettering | cars-blue-type | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, blue, white, navy, powder blue, typography, blue wheels, wallpaper, pastel, Porsche · Blue Lettering, reference |
| 15 | McLaren · Carbon Lettering | cars-black-mclaren-type | cars, car, automotive, sports car, mobile, phone wallpaper, McLaren, black, charcoal, gray, grey, carbon fiber, typography, monochrome, dark, wallpaper, McLaren · Carbon Lettering, reference |
| 16 | Porsche · Silver Signature | cars-black-porsche-type | cars, car, automotive, sports car, mobile, phone wallpaper, Porsche, 911, GT3 RS, black, graphite, silver, gray, grey, crest, script, monochrome, wallpaper, Porsche · Silver Signature, reference |

## Validation

- Focused Cars, keyword, collection and admin tests passed; the combined focused run passed 60/61, with the remaining failure in the existing Hunter dense-schedule expectations.
- Production build and ESLint for changed JavaScript passed.
- The active full suite also exposed the existing Hunter chibi placement failure. A probe confirmed every template that unexpectedly accepts the dense schedule is an hxh design; none is a Cars design.
- Inventory assertions include both Cars and the concurrently added Collage collection. The admin three-device fixture explicitly selects a design that is not mobile-only.
- Design hook triage: no new design issue found. The existing Georgia font-customization test is an intentional fixture; its narrow font-value false positive was suppressed in `.impeccable/config.json`. The reported DESIGN.md/design.json drift was left unchanged because design-system maintenance is outside this catalog task.
- Artwork was visually reviewed during generation. No live browser schedule screenshot was captured for this catalog-only integration.

## Provenance

Generation prompts and reference provenance remain in `output/car-mobile-review/prompts-*.json` and `output/car-mobile-reference-review/prompts-*.json`. These assets used built-in image_gen. Phone copies are technical exports with native images preserved.
