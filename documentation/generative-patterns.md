# Original generative prints

100 new prints join the existing Patterns & prints collection: 35 geometric, 35 organic, and 30 playful. All are resolution-independent Canvas geometry, available on mobile (1080 × 2400), tablet (1600 × 2560), and laptop (1920 × 1080). The same renderer powers gallery previews, customization, and PNG downloads.

## Provenance

Visual research used fffuel's ooorganize, sssquiggly, uuundulate, ccchaos, and decorative-pattern directions. These are original implementations; no fffuel images, exports, or source code are bundled. The [fffuel image license](https://www.fffuel.co/license/) permits personal/commercial use but prohibits redistribution of the images, which does not fit a downloadable-wallpaper collection. No fffuel package or external runtime is required.

## Customization

Each print exposes background, primary pattern, and accent colors; pattern size (50–200%); and pattern opacity (0–100%). Existing schedule typography, placement, fill, borders, and layout controls remain available. Reset appearance returns to the design's own defaults. Motifs scale uniformly against the shorter canvas edge, avoiding stretching when device aspect ratio changes.

Pattern tiles are generated locally at raster resolutions matched to the output size, avoiding enlarged low-resolution tiles in tablet exports. The cache caps both entry count (48) and pixel storage (32 MiB). Changing colors regenerates the tile; scale reuses it within a resolution bucket, while opacity reuses it unchanged. Transparent tiles allow the background color to remain independently editable. Patterns are deterministic across preview/export and do not require image downloads.

## Validation

The completed implementation passed 260 active tests, the production build, and focused lint. Browser rendering exported all 100 designs at each device's full resolution: 300 background PNGs in `output/generative-patterns/mobile`, `output/generative-patterns/tablet`, and `output/generative-patterns/laptop`. Sample schedules fit every exported design without overflow. The export harness also found 100 distinct monochrome motif raster fingerprints on each device, comparing geometry independently of the preset palettes.

All five customization properties changed rendered pixels for every design/device combination: background color, primary motif color, accent color, pattern size, and pattern opacity. Detailed per-export results are in `output/generative-patterns/verification.json`. Four contact sheets and representative full-resolution schedule previews sit alongside that report.

The actual editor was exercised at 390px, 820px, and 1440px viewport widths. Keyboard changes to the size and opacity sliders updated the preview; Reset appearance restored the exact original preview pixels and default slider values. All three viewports passed the horizontal-overflow check. Captures are `output/generative-patterns/editor-{mobile,tablet,laptop}.png` and `preview-{mobile,tablet,laptop}.png`; `ui-check.mjs` records the exercised flow.

## Integration boundary

This is an extension of the existing Patterns & prints collection and appearance controls. The white/slate application palette, DM Sans type system, shared control styling, focus treatment, and wallpaper schedule layout remain governed by the incumbent `DESIGN.md` and `.impeccable/design.json`. Wallpaper palettes are independently editable artwork values, not new application tokens.

Local preview catalog additions make the new designs available during development. They do not publish or modify the remote cloud catalog; remote catalog publication is a separate operation. No fffuel images, exports, or source code were copied or redistributed.
