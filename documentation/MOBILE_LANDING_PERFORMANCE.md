# Mobile landing rendering and performance — October 18, 2026

Two repaint causes were reproduced and fixed:

- Each carousel used a collection-dependent React key on its picture. Every automatic change removed the current image element and created a replacement. The picture and image now remain mounted; the current artwork stays visible until the requested replacement has decoded. Cancelled requests cannot replace a newer selection, and failed requests retain the displayed artwork. Autoplay restarts after a successful replacement and retains hover, focus, visibility, and reduced-motion pauses.
- Returning visitors with `schedsnap:pageviews` in local storage initially rendered a different counter than the prerendered HTML. React reported hydration error 418 and replaced the landing page, including its hero. The cache now uses a hydration-safe external-store snapshot. A browser reproduction confirmed that the original hero is retained after the fix.

The hero now uses stable `svh` measurements so mobile browser toolbar expansion does not continuously resize the page above the showcases. The open navigation panel retains `dvh` so it fills the available screen. Actual resizing and orientation changes still update the layout.

The responsive AVIF hero files are approximately 33% smaller, with their original dimensions and transparency retained. The build preloads the matching AVIF only on the homepage, and the decorative background has low fetch priority. Tailwind scans application source and the entry HTML explicitly, reducing the initial stylesheet from 96,027 to 90,565 bytes and avoiding utility classes discovered in local output and documentation.

## Verification

Local production build, Chrome Lighthouse defaults with simulated mobile throttling:

| Category | Mobile before | Mobile final | Desktop final |
| --- | ---: | ---: | ---: |
| Performance | 94 | 95 | 100 |
| Accessibility | 100 | 100 | 100 |
| Best practices | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 |

The final mobile LCP was 2.89 seconds, CLS was zero, and total blocking time was 2 milliseconds. These are local lab results, not deployed-site or physical-phone measurements. The Vite production preview serves static assets; live catalog and visit API responses were not benchmarked. Scores can vary between runs.

Browser regression checks passed for automatic rotation across all three device showcases: original image retained, no scroll movement, no frame-height change, and unchanged focus. Checks also covered a slow and failed replacement, manual recovery, reduced motion, returning-visitor hydration, mobile navigation, editor font loading, in-app browser advice, and no horizontal overflow from 320px through 1440px. Mobile and desktop screenshots were inspected. Changed JavaScript lint, the production build, and all 257 tests in `tests/` passed. Plain `node --test` also discovers incomplete historical test copies under `output/`; the main suite was therefore run explicitly with `node --test "tests/*.test.js"`.

Evidence: `output/check-landing-stability-20261018.mjs`, `output/landing-stability-after-20261018.json`, `output/landing-mobile-baseline-20261018.json`, `output/landing-mobile-final-20261018.json`, and `output/landing-desktop-final-20261018.json`.

No deployment was performed. A real mobile browser is still needed to verify physical toolbar behavior and perceived frame smoothness.
