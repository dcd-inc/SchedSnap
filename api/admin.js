import { randomUUID } from 'node:crypto';
import { createFeedbackStore } from '../server/feedbackStore.js';
import { feedbackPageOptions, paginateFeedback } from '../server/feedbackPagination.js';
import { authConfigured, createSession, isAuthenticated, sameOrigin, sessionCookie, verifyAdminPassword } from '../server/adminAuth.js';
import { cloudConfigured, createCatalogStore, signCloud } from '../server/catalogStore.js';
import { templateSchema } from '../shared/templateSchema.js';
import { availableTemplateDevices, templateDevices } from '../shared/templateVisibility.js';
import { wallpaperTemplates } from '../src/assets/templates.js';
import { genshinElementalTemplates } from '../src/assets/genshinElementalTemplates.js';
import { generateDesignId } from '../shared/designId.js';
import { artworkIds, createArtworkDeleter } from '../server/deleteArtwork.js';
import { createDesignDownloads } from '../server/designDownloads.js';
import { createDesignLikes } from '../server/designLikes.js';
import { withTemplateKeywords } from '../shared/templateKeywords.js';

export function createAdminHandler({ env = process.env, store = createCatalogStore(env), now = () => Date.now(), destroyArtwork = createArtworkDeleter(env), resolveArtworkIds = template => artworkIds(template, env), downloads = createDesignDownloads({ env }), likes = createDesignLikes({ env }), feedback = createFeedbackStore({ env }) } = {}) {
  const attempts = new Map();
  let feedbackSnapshot;
  let feedbackSnapshotUntil = 0;
  function clearFeedbackSnapshot() { feedbackSnapshot = undefined; feedbackSnapshotUntil = 0; }
  let saving = false;
  return async function admin(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    const fail = (status, message) => response.status(status).json({ error: { message } });
    if (!['GET', 'POST'].includes(request.method)) return fail(405, 'Method not allowed.');
    if (!authConfigured(env)) return fail(503, 'Set ADMIN_PASSWORD to at least 16 characters in the server environment, then restart or redeploy.');
    const action = new URL(request.url, 'http://localhost').searchParams.get('action') || 'session';
    if (request.method === 'GET') {
      const authenticated = isAuthenticated(request, env, now());
      if (action === 'session') return response.status(200).json({ authenticated });
      if (!authenticated) return fail(401, 'Sign in to manage designs.');
      if (action === 'feedback') {
        let options;
        const params = new URL(request.url, 'http://localhost').searchParams;
        if (params.has('limit')) {
          try { options = feedbackPageOptions(params); }
          catch { return fail(400, 'Invalid feedback filters.'); }
        }
        try {
          // Reuse one short-lived read across scrolling requests; writes invalidate it immediately.
          if (!feedbackSnapshot || now() >= feedbackSnapshotUntil) {
            feedbackSnapshotUntil = now() + 5000;
            feedbackSnapshot = feedback.read();
          }
          const messages = await feedbackSnapshot;
          return response.status(200).json(options ? paginateFeedback(messages, options) : { feedback: messages });
        }
        catch { clearFeedbackSnapshot(); return fail(503, 'Feedback could not load. Please retry.'); }
      }
      if (action === 'metrics') {
        try {
          const catalog = await store.read();
          const ids = catalog.templates.map(template => template.id);
          const [downloadCounts, heartCounts] = await Promise.all([downloads.summary(ids), likes.read(ids, null)]);
          return response.status(200).json({ ...downloadCounts, likes: heartCounts });
        } catch { return fail(503, 'Design stats could not load. Please retry.'); }
      }
      if (action === 'dashboard') {
        const embedUrl = env.POSTHOG_DASHBOARD_EMBED_URL || '';
        if (!embedUrl) return response.status(200).json({ embedUrl: '' });
        try {
          const url = new URL(embedUrl);
          const isPostHogHost = url.hostname === 'posthog.com' || url.hostname.endsWith('.posthog.com');
          const isDashboardPath = url.pathname.startsWith('/embedded/') || url.pathname.startsWith('/shared/');
          if (url.protocol !== 'https:' || !isPostHogHost || !isDashboardPath) throw new Error('Invalid dashboard URL');
          return response.status(200).json({ embedUrl: url.href });
        } catch { return fail(503, 'Set a valid PostHog dashboard embed URL in the server environment.'); }
      }
      if (action !== 'catalog') return fail(404, 'Unknown action.');
      try { return response.status(200).json(await store.read(true)); }
      catch { return fail(503, 'The catalog could not load. Check Cloudinary configuration and retry.'); }
    }
    if (!sameOrigin(request)) return fail(403, 'This request must come from the admin page.');
    if (!request.headers?.['content-type']?.startsWith('application/json')) return fail(415, 'Send JSON.');
    const body = request.body;
    if (!body || typeof body !== 'object' || JSON.stringify(body).length > 100000) return fail(400, 'Invalid request.');
    if (action === 'login') {
      if ((env.VERCEL || env.NODE_ENV === 'production') && env.ADMIN_LOGIN_RATE_LIMIT_CONFIGURED !== 'true') return fail(503, 'Configure the Vercel login rate limit before enabling admin access.');
      const key = String(request.headers?.['x-real-ip'] || request.socket?.remoteAddress || 'local');
      const time = now();
      for (const [ip, value] of attempts) if (value.until <= time) attempts.delete(ip);
      if (attempts.size > 10000) return fail(429, 'Too many sign-in attempts. Try again later.');
      const counter = attempts.get(key) || { count: 0, until: time + 15 * 60000 };
      if (counter.count >= 5) { response.setHeader('Retry-After', String(Math.ceil((counter.until - time) / 1000))); return fail(429, 'Too many sign-in attempts. Try again in 15 minutes.'); }
      counter.count++; attempts.set(key, counter);
      if (!verifyAdminPassword(body.password, env)) return fail(401, 'Incorrect password.');
      attempts.delete(key);
      response.setHeader('Set-Cookie', sessionCookie(createSession(env, time), env));
      return response.status(200).json({ authenticated: true });
    }
    if (!isAuthenticated(request, env, now())) return fail(401, 'Your session ended. Sign in again.');
    if (action === 'logout') { response.setHeader('Set-Cookie', sessionCookie('', env)); return response.status(200).json({ authenticated: false }); }
    if (action === 'feedback-bulk') {
      const validIds = Array.isArray(body.ids) && body.ids.length > 0 && body.ids.length <= 100 && body.ids.every(id => typeof id === 'string' && id.length > 0 && id.length <= 100) && new Set(body.ids).size === body.ids.length;
      const changeKeys = ['status', 'starred', 'read', 'deleted'].filter(key => body[key] !== undefined);
      const validChange = changeKeys.length === 1 && (body.status !== undefined ? ['open', 'resolved', 'archived'].includes(body.status) : body.deleted !== undefined ? body.deleted === true : typeof body[changeKeys[0]] === 'boolean');
      if (!validIds || !validChange) return fail(400, 'Select up to 100 messages and choose a valid action.');
      try {
        const updated = body.deleted ? await feedback.deleteMany(body.ids) : await feedback.updateMany(body.ids, { [changeKeys[0]]: body[changeKeys[0]] });
        if (!updated) return fail(409, 'Feedback changed. Refresh and try again.');
        clearFeedbackSnapshot();
        return response.status(200).json({ ok: true });
      } catch { return fail(503, 'Feedback could not be updated. Please retry.'); }
    }
    if (action === 'feedback-star') {
      if (typeof body.id !== 'string' || !body.id || body.id.length > 100 || typeof body.starred !== 'boolean') return fail(400, 'Invalid feedback star.');
      try {
        if (!await feedback.setStarred(body.id, body.starred)) return fail(404, 'Feedback not found.');
        clearFeedbackSnapshot();
        return response.status(200).json({ ok: true });
      } catch { return fail(503, 'Feedback could not be updated. Please retry.'); }
    }
    if (action === 'feedback-status') {
      if (typeof body.id !== 'string' || !body.id || body.id.length > 100 || (body.status !== undefined ? !['open', 'resolved', 'archived'].includes(body.status) : typeof body.resolved !== 'boolean')) return fail(400, 'Invalid feedback status.');
      try {
        const updated = body.status !== undefined ? await feedback.setStatus(body.id, body.status) : await feedback.setResolved(body.id, body.resolved);
        if (!updated) return fail(404, 'Feedback not found.');
        clearFeedbackSnapshot();
        return response.status(200).json({ ok: true });
      } catch { return fail(503, 'Feedback could not be updated. Please retry.'); }
    }
    if (!cloudConfigured(env)) return fail(503, 'Configure Cloudinary before managing designs.');
    if (action === 'upload') {
      const parameters = { public_id: `schedsnap/admin/artwork/${randomUUID()}`, overwrite: 'false', allowed_formats: 'png,jpg,webp', timestamp: String(Math.floor(now() / 1000)) };
      return response.status(200).json({ cloud: env.CLOUDINARY_CLOUD_NAME, apiKey: env.CLOUDINARY_API_KEY, parameters, signature: signCloud(parameters, env) });
    }
    if (!['save', 'visibility', 'delete'].includes(action)) return fail(404, 'Unknown action.');
    if (saving) return fail(409, 'Another change is saving. Try again.');
    saving = true;
    try {
      let catalog = await store.read(true);
      if (body.revision !== catalog.revision) return fail(409, 'The library changed in another tab. Reload it before saving.');
      if (action === 'save') {
        const input = body.create === true ? { ...body.template, id: generateDesignId(body.template?.name, catalog.templates.map(t => t.id)) } : body.template;
        const parsed = templateSchema.safeParse(input);
        if (!parsed.success) return fail(400, parsed.error.issues[0].message);
        const template = withTemplateKeywords(parsed.data);
        const index = catalog.templates.findIndex(t => t.id === template.id);
        if (catalog.templates[index]?.deletionPending) return fail(409, 'This design is being deleted. Finish deletion before editing.');
        const previous = catalog.templates[index];
        const paths = [template.image, ...Object.values(template.deviceImages || {})].filter(Boolean);
        // Catalog-only designs and preview collections retain their stored artwork when edited or saved.
        const existingPaths = new Set([...wallpaperTemplates, ...genshinElementalTemplates, ...catalog.templates].flatMap(t => [t.image, ...Object.values(t.deviceImages || {})].filter(Boolean)));
        if (paths.some(path => path.startsWith('/') ? !existingPaths.has(path) : !path.startsWith(`https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/`))) return fail(400, 'Artwork must belong to this library.');
        // Dates are server-owned: editing or re-publishing must not renew New.
        delete template.createdAt; delete template.publishedAt;
        if (previous?.createdAt) template.createdAt = previous.createdAt;
        if (previous?.publishedAt) template.publishedAt = previous.publishedAt;
        if (index < 0) template.createdAt = new Date(now()).toISOString();
        if (template.status === 'published' && !template.publishedAt && (index < 0 || (previous?.status === 'draft' && previous.createdAt))) template.publishedAt = new Date(now()).toISOString();
        if (index < 0) catalog.templates.unshift(template); else catalog.templates[index] = template;
      } else if (action === 'visibility') {
        const template = catalog.templates.find(t => t.id === body.id);
        if (!template) return fail(404, 'Design not found.');
        if (template.deletionPending) return fail(409, 'Finish deleting this design before publishing.');
        let status = body.status;
        let hiddenDevices;
        if (body.visibleDevices !== undefined) {
          const available = availableTemplateDevices(template);
          if (!Array.isArray(body.visibleDevices) || body.visibleDevices.some(device => !available.includes(device)) || new Set(body.visibleDevices).size !== body.visibleDevices.length) return fail(400, 'Choose only available device sizes.');
          status = body.visibleDevices.length ? 'published' : 'hidden';
          hiddenDevices = templateDevices.filter(device => !body.visibleDevices.includes(device));
        }
        if (status !== 'hidden' && status !== 'published') return fail(400, 'Invalid visibility.');
        if (status === 'published') {
          const parsed = templateSchema.safeParse({ ...template, status: 'published' });
          if (!parsed.success) return fail(422, 'This design needs artwork before publishing. Open Edit to add the missing device images.');
        }
        if (status === 'published' && template.status === 'draft' && template.createdAt && !template.publishedAt) template.publishedAt = new Date(now()).toISOString();
        template.status = status;
        if (hiddenDevices) template.hiddenDevices = hiddenDevices;
        else delete template.hiddenDevices;
      } else if (action === 'delete') {
        const template = catalog.templates.find(t => t.id === body.id);
        if (!template) return fail(404, 'Design not found.');
        if (body.confirmation !== template.name) return fail(400, 'Type the exact design title to confirm permanent deletion.');
        const others = catalog.templates.filter(t => t.id !== body.id);
        const shared = new Set(others.flatMap(resolveArtworkIds));
        const targets = resolveArtworkIds(template).filter(id => !shared.has(id));
        if (targets.some(id => id.startsWith('local:'))) return fail(422, 'Some artwork is not mapped to Cloudinary. Upload or map it before permanently deleting this design.');
        // Hide and persist the deletion intent first. On remote failure the
        // record remains available for a safe, idempotent retry.
        template.status = 'hidden'; template.deletionPending = true;
        catalog = await store.write(catalog);
        try {
          for (const publicId of targets) await destroyArtwork(publicId);
          const completed = { ...catalog, templates: catalog.templates.filter(t => t.id !== body.id) };
          return response.status(200).json(await store.write(completed));
        } catch {
          return response.status(503).json({ catalog, error: { message: 'Deletion could not finish. The design is hidden; retry Delete to remove the remaining artwork.' } });
        }
      }
      return response.status(200).json(await store.write(catalog));
    } catch { return fail(503, 'Could not save the library. Check Cloudinary and try again.'); }
    finally { saving = false; }
  };
}
export default createAdminHandler();
