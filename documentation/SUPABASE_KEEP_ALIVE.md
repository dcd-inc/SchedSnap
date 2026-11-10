# Supabase keep-alive

`GET /api/keep-alive` makes one read-only query against the creator submissions
table. It returns `200 {"ok":true}` on success, `401` for a wrong bearer token,
or `503` when configuration is missing or the database cannot be queried.
It returns no submission data, disables HTTP caching, and closes its database
connection after each request. No migration is needed if creator submissions
are already configured.

## Deploy first

1. Generate a private random token, for example with
   `node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'))"`.
2. In Vercel project settings, add `CRON_SECRET` for Production with that token.
   Keep the existing `SUPABASE_DB_URL` configured for the same Supabase project.
   Never prefix this token with `VITE_` or put it in the URL.
3. Deploy the endpoint and environment setting to Production.

## cron-job.org settings

Log in at <https://console.cron-job.org/login> and create a cron job:

| Setting | Value |
| --- | --- |
| Title | SchedSnap Supabase keep-alive |
| URL | `https://schedsnap.chrbuilds.dev/api/keep-alive` |
| Enabled | Yes |
| Schedule | Every 6 hours (custom cron: `0 */6 * * *`) |
| Request method | GET |
| Custom header name | `Authorization` |
| Custom header value | `Bearer YOUR_CRON_SECRET` |
| Request body | Empty |
| Failure notifications | Enable |

Replace `YOUR_CRON_SECRET` with the exact token saved in Vercel, including
the `Bearer ` prefix and its space in the header. Custom request headers are
available in the job's advanced settings. Run a test execution after deployment;
expect HTTP 200 with `{"ok":true}`. A browser visit without the header should
return 401. If the project is already paused, restore it in Supabase first.

Supabase evaluates low database activity over seven days; its documentation
says a few daily user database requests are typically sufficient, but does not
guarantee that periodic checks prevent pausing. Paid projects are exempt from
inactivity pausing. See [Supabase's policy](https://supabase.com/docs/guides/platform/free-project-pausing)
and [cron-job.org's header support](https://cron-job.org/en/faq/).
