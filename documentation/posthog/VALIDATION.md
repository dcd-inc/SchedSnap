# Analytics validation — October 27, 2026

## Local verification

- 71 tests passed: `node --test tests/analyticsWorkflow.test.js tests/useDesignLikes.test.js tests/cookieConsent.test.js tests/analyze.test.js tests/visits.test.js`.
- Actual component handlers were executed with mocked browser/image/AI services. No synthetic events were sent to production PostHog.
- Simulations cover all three target devices, five layouts, six container styles, custom/preset backgrounds, manual/sample/image input, both AI providers, cancellation/failure, photo preparation/cropping, and download success/failure/repeats.
- API tests verify the configured Gemini model and successful DeepSeek fallback model are returned accurately.
- Consent tests verify rejection/withdrawal prevent tracking. Payload checks exclude schedule text, titles, filenames and image data.
- Production build, lint of changed source/tests and `git diff --check` passed. Repository-wide lint still fails on unrelated generated/output files and existing scripts.

## PostHog changes

Existing dashboard: https://us.posthog.com/project/643035/dashboard/2170601

- Fixed average import duration: `import_completed` → `schedule_import_succeeded`.
- Fixed import outcomes: `import_completed`/`import_failed` → `schedule_import_succeeded`/`schedule_import_failed`; renamed to Import successes and failures.
- Fixed sample versus non-sample download series to filter `schedule_source` instead of the unused `is_sample` property.
- Template selection ranking now uses a table, 100 individual designs and no Other bucket. Verified 58 design rows were visible.
- Added eight manually authored insights: schedule input usage, target-device downloads, final-layout downloads, final-style downloads, custom/preset downloads, custom-photo workflow, successful AI models, and import speed by model.
- The dashboard defaults filter `site_name = schedsnap`, `environment = production`, and `$host = schedsnap.chrbuilds.dev`. The new SQL insights also filter these properties directly and use a rolling last 30 days.
- Removed the newly added likes and most-downloaded insight cards from the dashboard at the user's request. Existing site likes and downloads remain unchanged.
- Country map rendered correctly. Download failures uses the correct event and currently has no matching events; this is not evidence of a query failure.
- No PostHog AI prompt was submitted. The dashboard Refresh button was not pressed.

## Data limits and deployment

The tracking changes are local until deployed. New event dimensions are not backfilled. Missing historical layouts/styles/models remain Unknown. Historical device sizes can be classified from recorded output dimensions; custom backgrounds use the established `custom-background` template ID.

Schedule-input counts overlap and mean starts, sample loads, prepared uploads and successful AI imports. Downloads mean browser initiation, not a verified save to disk. Model analytics describes the successful provider/model, including fallback, not every failed internal attempt.

After deployment, perform one consented manual/sample/custom-photo/download flow and a schedule import, then check incoming events for the new dimensions. A production delivery smoke test has not yet been performed. Keep deliberate test traffic separately labelled when testing live ingestion.
