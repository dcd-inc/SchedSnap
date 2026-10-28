const folders = ['open', 'resolved', 'archived', 'starred'];
const categories = ['Feature request', 'Design suggestion', 'Report a problem', 'Other feedback'];
export function feedbackPageOptions(params) {
  const folder = params.get('folder') || 'open';
  const category = params.get('category') || 'all';
  const query = (params.get('q') || '').trim().toLowerCase();
  const limit = Number(params.get('limit') || 20);
  const rawCursor = params.get('cursor');
  let cursor = null;
  if (rawCursor) {
    if (rawCursor.length > 400) throw new Error('Invalid cursor');
    cursor = JSON.parse(Buffer.from(rawCursor, 'base64url').toString());
    if (typeof cursor?.id !== 'string' || cursor.id.length > 100 || typeof cursor.createdAt !== 'string' || !Number.isFinite(Date.parse(cursor.createdAt))) throw new Error('Invalid cursor');
  }
  if (!folders.includes(folder) || (category !== 'all' && !categories.includes(category)) || query.length > 500 || !Number.isInteger(limit) || limit < 1 || limit > 50) throw new Error('Invalid filters');
  return { folder, category, query, limit, cursor };
}

export function paginateFeedback(items, { folder, category, query, limit, cursor }) {
  const counts = Object.fromEntries(folders.map(value => [value, 0]));
  for (const item of items) {
    counts[item.status]++;
    if (item.starred && item.status !== 'trash') counts.starred++;
  }
  const matches = items.filter(item => (folder === 'starred' ? item.starred && item.status !== 'trash' : item.status === folder)
    && (category === 'all' || item.category === category)
    && `${item.category} ${item.message}`.toLowerCase().includes(query)
    && (!cursor || item.createdAt.localeCompare(cursor.createdAt) < 0 || (item.createdAt === cursor.createdAt && item.id.localeCompare(cursor.id) < 0)));
  const feedback = matches.slice(0, limit);
  const last = feedback.at(-1);
  return { feedback, counts, nextCursor: matches.length > limit ? Buffer.from(JSON.stringify({ id: last.id, createdAt: last.createdAt })).toString('base64url') : null };
}
