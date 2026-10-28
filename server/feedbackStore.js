import { createHash, createHmac, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';

const script = `local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count >= tonumber(ARGV[1]) then return 0 end
redis.call('HSET', KEYS[2], ARGV[4], ARGV[3])
redis.call('INCR', KEYS[1])
redis.call('EXPIREAT', KEYS[1], ARGV[2])
return 1`;
const local = { counts: new Map(), messages: [], statuses: new Map() };
const deleteScript = `local data = cjson.decode(ARGV[1])
if #data.legacy > 0 then
  local existing = redis.call('LRANGE', KEYS[3], 0, -1)
  if #existing ~= #data.legacy then return 0 end
  for i, item in ipairs(data.legacy) do
    if existing[i] ~= item.raw then return 0 end
  end
  for _, item in ipairs(data.legacy) do
    if not item.remove then redis.call('HSET', KEYS[1], item.id, item.stored) end
  end
  redis.call('DEL', KEYS[3])
end
for _, id in ipairs(data.ids) do
  redis.call('HDEL', KEYS[1], id)
  redis.call('HDEL', KEYS[2], id, 'star:' .. id, 'read:' .. id)
end
return 1`;
export function createFeedbackStore({ env = process.env, fetcher = fetch, now = () => Date.now() } = {}) {
  const configured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN && env.IMPORT_LIMIT_SECRET);
  const configuredLimit = Number(env.FEEDBACK_DAILY_LIMIT);
  const limit = Number.isSafeInteger(configuredLimit) && configuredLimit > 0 ? configuredLimit : 10;
  async function redis(command) {
    const url = new URL(env.UPSTASH_REDIS_REST_URL);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Invalid storage URL');
    const response = await fetcher(url.origin, { method: 'POST', headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), signal: AbortSignal.timeout(5000), redirect: 'error' });
    const data = await response.json();
    if (!response.ok || data.error || data.result === undefined) {
      const error = new Error('Storage unavailable');
      error.redisCode = typeof data.error === 'string' && data.error.startsWith('NOPERM') ? 'NOPERM' : '';
      throw error;
    }
    return data.result;
  }
  function ready() { if (!configured && (env.VERCEL || env.NODE_ENV === 'production')) throw new Error('Storage unavailable'); }
  function allowanceKey(request) {
      ready();
      const ip = env.VERCEL ? request.headers?.['x-vercel-forwarded-for']?.split(',')[0]?.trim() : request.socket?.remoteAddress;
      if (!ip || !isIP(ip)) throw new Error('Identity unavailable');
      const time = now(), day = Math.floor((time + 28800000) / 86400000), reset = (day + 1) * 86400000 - 28800000;
      const identity = createHmac('sha256', env.IMPORT_LIMIT_SECRET || 'local-development').update(`feedback:${day}:${ip}`).digest('hex');
      const key = `schedsnap:feedback:limit:${day}:${identity}`;
      return { key, reset, time };
  }
  return {
    async status(request) {
      const { key, reset } = allowanceKey(request);
      const count = Number(configured ? await redis(['GET', key]) : local.counts.get(key)?.count || 0);
      if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid feedback count');
      return { limit, remaining: Math.max(0, limit - count), reset };
    },
    async submit(request, feedback) {
      const { key, reset, time } = allowanceKey(request);
      const id = randomUUID();
      const entry = JSON.stringify({ id, ...feedback, createdAt: new Date(time).toISOString() });
      if (configured) return Number(await redis(['EVAL', script, '2', key, 'schedsnap:feedback:entries', String(limit), String(Math.floor(reset / 1000)), entry, id])) === 1;
      for (const [k, value] of local.counts) if (value.reset <= time) local.counts.delete(k);
      const count = local.counts.get(key)?.count || 0;
      if (count >= limit) return false;
      local.counts.set(key, { count: count + 1, reset }); local.messages.unshift(entry); return true;
    },
    async read(internal = false) {
      ready();
      let entries = local.messages.slice();
      let hashCount = entries.length;
      if (configured) {
        const stored = await redis(['HGETALL', 'schedsnap:feedback:entries']);
        if (!Array.isArray(stored) || stored.length % 2) throw new Error('Invalid feedback storage');
        entries = stored.filter((_, index) => index % 2 === 1);
        hashCount = entries.length;
        // Older installations may have used a Redis list; restricted accounts cannot read it.
        try { entries.push(...await redis(['LRANGE', 'schedsnap:feedback:messages', '0', '-1'])); }
        catch (error) { if (error.redisCode !== 'NOPERM') throw error; }
      }
      if (!Array.isArray(entries)) throw new Error('Storage unavailable');
      const occurrences = new Map();
      const messages = entries.map((entry, index) => {
        const item = JSON.parse(entry);
        const hash = createHash('sha256').update(entry).digest('hex');
        const occurrence = occurrences.get(hash) || 0;
        occurrences.set(hash, occurrence + 1);
        return { ...item, id: item.id || `legacy-${hash}-${occurrence}`, ...(internal ? { _raw: entry, _legacy: index >= hashCount, _index: index } : {}) };
      });
      const statusFields = configured && messages.length ? await redis(['HGETALL', 'schedsnap:feedback:status']) : [];
      if (!Array.isArray(statusFields) || statusFields.length % 2) throw new Error('Invalid feedback status');
      const statuses = configured ? new Map(Array.from({ length: statusFields.length / 2 }, (_, index) => [statusFields[index * 2], statusFields[index * 2 + 1]])) : local.statuses;
      return messages.map(item => {
        const storedStatus = statuses.get(item.id) || 'open';
        const status = storedStatus === 'trash' ? 'open' : storedStatus;
        return { ...item, status, resolved: status === 'resolved', starred: statuses.get(`star:${item.id}`) === '1', read: statuses.get(`read:${item.id}`) === '1' };
      }).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    },
    async setResolved(id, resolved) {
      return this.setStatus(id, resolved ? 'resolved' : 'open');
    },
    async setStatus(id, status) {
      if (!['open', 'resolved', 'archived', 'trash'].includes(status)) throw new Error('Invalid feedback status');
      const messages = await this.read();
      if (!messages.some(item => item.id === id)) return false;
      if (configured) await redis(['HSET', 'schedsnap:feedback:status', id, status]);
      else local.statuses.set(id, status);
      return true;
    },
    async setStarred(id, starred) {
      const messages = await this.read();
      if (!messages.some(item => item.id === id)) return false;
      if (configured) await redis(['HSET', 'schedsnap:feedback:status', `star:${id}`, starred ? '1' : '0']);
      else local.statuses.set(`star:${id}`, starred ? '1' : '0');
      return true;
    },
    async updateMany(ids, changes) {
      const messages = await this.read();
      const known = new Set(messages.map(item => item.id));
      if (ids.some(id => !known.has(id))) return false;
      const fields = ids.flatMap(id => changes.status !== undefined ? [id, changes.status] : changes.read !== undefined ? [`read:${id}`, changes.read ? '1' : '0'] : [`star:${id}`, changes.starred ? '1' : '0']);
      if (configured) await redis(['HSET', 'schedsnap:feedback:status', ...fields]);
      else for (let index = 0; index < fields.length; index += 2) local.statuses.set(fields[index], fields[index + 1]);
      return true;
    },
    async deleteMany(ids) {
      const messages = await this.read(true);
      const selected = new Set(ids);
      if (ids.some(id => !messages.some(item => item.id === id))) return false;
      if (configured) {
        const hasLegacySelection = messages.some(item => selected.has(item.id) && item._legacy);
        const legacy = hasLegacySelection ? messages.filter(item => item._legacy).sort((a, b) => a._index - b._index).map(item => ({ id: item.id, raw: item._raw, stored: JSON.stringify({ ...JSON.parse(item._raw), id: item.id }), remove: selected.has(item.id) })) : [];
        return Number(await redis(['EVAL', deleteScript, '3', 'schedsnap:feedback:entries', 'schedsnap:feedback:status', 'schedsnap:feedback:messages', JSON.stringify({ ids, legacy })])) === 1;
      }
      const raw = new Set(messages.filter(item => selected.has(item.id)).map(item => item._raw));
      local.messages = local.messages.filter(entry => !raw.has(entry));
      for (const id of ids) for (const field of [id, `star:${id}`, `read:${id}`]) local.statuses.delete(field);
      return true;
    },
  };
}
