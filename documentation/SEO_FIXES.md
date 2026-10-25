# SEO fixes — 23 October 2026

- The social preview image declared by every public page now survives the deployment asset filter. Its URL, dimensions and type are shared in SEO metadata; source-artwork PNGs remain excluded.
- The homepage FAQ links to the existing class schedule wallpaper guide.
- The hero description clearly identifies the free class schedule wallpaper maker.
- Homepage WebSite markup identifies the existing operator, .dcd. The creator has factual WebApplication markup. The same route-aware schema is used in initial HTML and client navigation; private editor sessions stay excluded. This does not claim software rich-result eligibility or invent reviews/ratings.
- Homepage and creator sitemap modification dates reflect this change.
- The creator remains focused on choosing a design. No extra introduction or guide-link block appears above its controls, following the user's preference.

## Verification

Production build, generated HTML/sitemap checks, SEO regression tests and targeted lint pass. All 303 tests in the current `tests/` directory passed. Unscoped Node test discovery also traversed old backup folders and reported failures there; that command is not a clean current-suite result.

A normal Chrome session loaded eight cards on the live creator, resolving the earlier audit's loading-only snapshot uncertainty. Local production preview checks cover 1440px and 390px layouts, schema changes on navigation, the homepage guide link, exclusion of the unwanted creator introduction, no horizontal overflow and the preview image returning HTTP 200 with image/png. Local static preview uses the public live catalog as a read-only fixture; its engagement-count API errors are not live-site results.

Current live performance remains unmeasured because the audit's public PageSpeed request was rate limited. Existing build chunk-size warnings are not resolved by these focused SEO changes. Google indexing and actual social preview refresh require deployment and external checks.

## Google Search Console after deployment

A local commit does not update the public site. Wait until this commit is deployed and confirm the image and homepage guide link are visible at the public URLs.

In Search Console, use URL Inspection, Test live URL, then Request indexing once for:

- `https://schedcanvas.vercel.app/`
- `https://schedcanvas.vercel.app/services/schedule-wallpaper`
- `https://schedcanvas.vercel.app/guides/class-schedule-wallpaper`

The request is optional but useful for these few changed/discoverable URLs. If the sitemap is already submitted and successful, it does not need to be removed or repeatedly resubmitted. If it has never been submitted, add `https://schedcanvas.vercel.app/sitemap.xml` under Sitemaps. Do not request indexing for admin, private editor sessions or filter URLs.

Google may take days to weeks to recrawl. Requesting the same URL repeatedly does not speed it up, and requesting indexing does not guarantee inclusion. See [Google's recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).
