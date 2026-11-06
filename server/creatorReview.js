import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { cloudConfigured } from './catalogStore.js';
import { connectCreatorDatabase } from './creatorDatabase.js';
import { cloudImageApi, cloudTimestamp, creatorArtworkPreview, signedArtworkParams } from './creatorArtwork.js';
import { templateSchema } from '../shared/templateSchema.js';
import { communityWallpaperStyle } from '../shared/communityWallpaperStyle.js';
import { withTemplateKeywords } from '../shared/templateKeywords.js';

const reviewSchema = z.strictObject({
  id: z.uuid(),
  revision: z.uuid(),
  decision: z.enum(['approve', 'needs_changes', 'declined']),
  note: z.string().trim().max(500).optional(),
});
const pageSize = 24;
const designId = id => `community-${id}`;

class ReviewConflict extends Error {}

export function createCreatorReview({ env, store, fetcher = fetch, db } = {}) {
  let sql = db;
  function database() {
    if (!cloudConfigured(env) || (!sql && !env.SUPABASE_DB_URL)) throw new Error('Creator review is not configured.');
    return sql ??= connectCreatorDatabase(env);
  }

  async function withCatalogLock(callback) {
    if (!sql && !env.SUPABASE_DB_URL) return callback();
    return database().begin(async tx => {
      await tx`select pg_advisory_xact_lock(hashtextextended('schedsnap:catalog-write', 0))`;
      return callback();
    });
  }

  async function approvedImage(row) {
    const response = await fetcher(creatorArtworkPreview(row.artwork_id, env), { signal: AbortSignal.timeout(10000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/jpeg')) throw new Error('Private artwork could not be loaded.');
    const image = await response.blob();
    if (image.size > 4 * 1024 * 1024) throw new Error('The approved image is too large.');
    const asset = `schedsnap/admin/artwork/${row.id}`;
    const form = new FormData();
    const params = signedArtworkParams({
      public_id: asset, overwrite: 'false', allowed_formats: 'jpg', timestamp: cloudTimestamp(),
    }, env);
    for (const [name, value] of Object.entries(params)) form.set(name, value);
    form.set('file', image, 'artwork.jpg');
    const upload = await fetcher(`${cloudImageApi(env)}/upload`, { method: 'POST', body: form, signal: AbortSignal.timeout(15000) });
    if (!upload.ok) throw new Error('Public artwork upload failed.');
    const result = await upload.json();
    if (result.public_id !== asset || result.type !== 'upload' || result.format !== 'jpg') throw new Error('Unexpected public artwork response.');
    return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${asset}.jpg`;
  }

  return {
    withCatalogLock,

    async list(request, response) {
      const params = new URL(request.url, 'http://localhost').searchParams;
      const page = Number(params.get('page') ?? 1);
      const query = (params.get('query') ?? '').trim().slice(0, 100);
      if (!Number.isInteger(page) || page < 1 || page > 10000) return response.status(400).json({ error: { message: 'Invalid review page.' } });
      try {
        const rows = await database()`select id, title, artist, status, artwork_id, revision, updated_at, ai_generated
          from schedsnap_creator.submissions where status in ('in_review', 'publishing')
          and (strpos(lower(title), lower(${query}::text)) > 0 or strpos(lower(artist), lower(${query}::text)) > 0)
          order by updated_at, id limit ${pageSize + 1} offset ${(page - 1) * pageSize}`;
        return response.status(200).json({
          submissions: rows.slice(0, pageSize).map(row => ({
            id: row.id, title: row.title, artist: row.artist, status: row.status, revision: row.revision,
            aiGenerated: row.ai_generated ?? null,
            updatedAt: row.updated_at, preview: creatorArtworkPreview(row.artwork_id, env),
          })),
          hasMore: rows.length > pageSize,
        });
      } catch {
        return response.status(503).json({ error: { message: 'Creator submissions could not load. Please try again.' } });
      }
    },

    async decide(request, response) {
      const fail = (status, message) => response.status(status).json({ error: { message } });
      const parsed = reviewSchema.safeParse(request.body);
      if (!parsed.success || (parsed.data.decision !== 'approve' && !parsed.data.note)) {
        return fail(400, 'Choose a decision and add a note if the design won’t be published.');
      }
      const { id, revision, decision, note } = parsed.data;
      try {
        const db = database();
        if (decision !== 'approve') {
          const updated = await db`update schedsnap_creator.submissions
            set status = ${decision}, review_note = ${note}, revision = ${randomUUID()}, updated_at = now()
            where id = ${id} and revision = ${revision} and status = 'in_review' returning id`;
          if (!updated.length) throw new ReviewConflict();
          return response.status(200).json({ status: decision });
        }

        // Reserve the reviewed revision before any external write. A retry completes
        // the same approval, while the creator cannot replace the approved artwork.
        const [row] = await db`update schedsnap_creator.submissions set status = 'publishing'
          where id = ${id} and revision = ${revision} and status in ('in_review', 'publishing') returning *`;
        if (!row) throw new ReviewConflict();
        let catalog = await store.read(true);
        if (!catalog.templates.some(item => item.id === designId(id))) {
          const image = await approvedImage(row);
          const time = new Date().toISOString();
          const template = withTemplateKeywords(templateSchema.parse({
            id: designId(id), name: row.title, artistCredit: row.artist, collection: 'community', mobileOnly: true,
            aiGenerated: row.ai_generated ?? undefined,
            status: 'published', createdAt: time, publishedAt: time, image, deviceImages: { mobile: image },
            ...communityWallpaperStyle,
          }));
          await withCatalogLock(async () => {
            catalog = await store.read(true);
            if (!catalog.templates.some(item => item.id === template.id)) {
              await store.write({ ...catalog, templates: [template, ...catalog.templates] });
            }
          });
        }
        const updated = await db`update schedsnap_creator.submissions
          set status = 'published', review_note = null, revision = ${randomUUID()}, updated_at = now()
          where id = ${id} and revision = ${revision} and status = 'publishing' returning id`;
        if (!updated.length) throw new ReviewConflict();
        return response.status(200).json({ status: 'published' });
      } catch (error) {
        if (error instanceof ReviewConflict) return fail(409, 'This submission changed. Refresh the queue and try again.');
        return fail(503, decision === 'approve' ? 'Publishing could not finish. Refresh the queue and retry approval.' : 'Could not save the review. Please try again.');
      }
    },
  };
}
