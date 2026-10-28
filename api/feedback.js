import { sameOrigin } from '../server/adminAuth.js';
import { createFeedbackStore } from '../server/feedbackStore.js';

export function createFeedbackHandler({ store = createFeedbackStore() } = {}) {
  return async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    const fail = (status, message) => response.status(status).json({ error: { message } });
    if (request.method === 'GET') {
      try { return response.status(200).json(await store.status(request)); }
      catch { return fail(503, 'Feedback is temporarily unavailable. Please try again later.'); }
    }
    if (request.method !== 'POST') return fail(405, 'Method not allowed.');
    if (!sameOrigin(request)) return fail(403, 'Please send feedback from SchedSnap.');
    if (!request.headers?.['content-type']?.startsWith('application/json')) return fail(415, 'Send JSON.');
    const { category, message } = request.body || {};
    if (!['Feature request', 'Design suggestion', 'Report a problem', 'Other feedback'].includes(category) || typeof message !== 'string' || !message.trim() || message.length > 500 || JSON.stringify(request.body).length > 6000) return fail(400, 'Choose a category and enter a message of up to 500 characters.');
    try {
      if (!await store.submit(request, { category, message: message.trim() })) return fail(429, 'You’ve reached the daily feedback limit. Please try again tomorrow.');
      return response.status(201).json({ ok: true });
    } catch { return fail(503, 'Feedback is temporarily unavailable. Please try again later.'); }
  };
}
export default createFeedbackHandler();
