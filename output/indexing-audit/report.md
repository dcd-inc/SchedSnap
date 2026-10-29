# SchedSnap indexing audit — October 25, 2026

## Finding and local fix

The homepage used an uncapped viewport-height hero with centered content. A local Chrome test at 390 × 12,000 placed the heading at y=5643.625px, reproducing a blank upper capture. Capping the hero at 1100px moves the heading to y=193.625px and the create button to y=363.375px. This reproduces the reported visual symptom; it does not establish Google's actual viewport or the cause of its indexing decision.

Changed `src/landing.css` and the homepage's sitemap last-modified date in `shared/seo.js`. The production build regenerates `dist/sitemap.xml` and `dist/robots.txt`. No URL migration is needed.

## Live checks

Checked the production website over HTTPS. The homepage, robots.txt, and sitemap.xml return HTTP 200 with appropriate HTML, plain-text, and XML content types. Robots allows crawling and declares the correct sitemap. The sitemap has six public URLs, with no editor/admin sessions. All six URLs return HTTP 200, each has one H1, a matching canonical URL, `index, follow`, and no X-Robots-Tag exclusion.

## Local verification

- Production build: passed.
- SEO and deployment tests: 6 passed.
- `node scripts/check-seo.mjs`: passed (prerendered content, titles, canonicals, assets, XML sitemap, robots.txt, private-route exclusions, verification file).
- Chrome: mobile 390 × 844, tablet 768 × 1024, desktop 1440 × 900, and tall capture 390 × 12,000. Heading and create button visible in the first 900px (or shorter viewport), no horizontal overflow or browser exceptions. Passed with and without JavaScript.
- Normal mobile, tablet, and desktop heading/button positions are unchanged by the height cap.
- Repository-wide lint reports 70 existing errors in unrelated scripts, vendored video assets, worktrees and output files. These files were not changed.

Screenshots and JSON measurements are saved beside this report. API-backed counters/catalog behavior was not evaluated by the local static-server check.

## After deployment

The local changes have not been deployed. After publishing, run Search Console's live URL test and inspect its screenshot. If content displays correctly, request indexing once if not already pending. Keep the existing sitemap submission. A successful render does not guarantee indexing, and the current evidence cannot establish Google's reason for excluding the page.
