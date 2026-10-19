import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

const DAY = 86400000;
const OFFSET = 8 * 3600000;
const reserveScript = `local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count >= tonumber(ARGV[2]) then return {count, 0} end
count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIREAT', KEYS[1], ARGV[1]) end
return {count, 1}`;
const releaseScript = `local count = tonumber(redis.call('GET', KEYS[1]) or '0')
if count > 0 then count = redis.call('DECR', KEYS[1]) end
return count`;

export function createImportUsage({ env = process.env, fetcher = fetch, now = () => Date.now() } = {}) {
  const limit = Math.max(1, Math.floor(Number(env.IMPORT_DAILY_LIMIT) || 15));
  const memory = new Map();
  function context(request) {
    const time = now();
    const day = Math.floor((time + OFFSET) / DAY);
    const resetsAt = (day + 1) * DAY - OFFSET;
    const production = Boolean(env.VERCEL || env.NODE_ENV === 'production');
    // Vercel overwrites this header; never trust client-supplied forwarded IP headers.
    const ip = env.VERCEL ? request.headers?.['x-vercel-forwarded-for']?.split(',')[0]?.trim() : request.socket?.remoteAddress;
    if (!ip || !isIP(ip)) throw new Error('Usage identity unavailable');
    const configured = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN && env.IMPORT_LIMIT_SECRET;
    if (production && !configured) throw new Error('Usage storage unavailable');
    const identity = createHmac('sha256', env.IMPORT_LIMIT_SECRET || 'local-development').update(`${day}:${ip}`).digest('hex');
    return { time, resetsAt, configured, key: `schedsnap:imports:${day}:${identity}` };
  }
  async function redis(command) {
    const url = new URL(env.UPSTASH_REDIS_REST_URL);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('Invalid usage storage URL');
    const response = await fetcher(url.origin, {
      method: 'POST', headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command), signal: AbortSignal.timeout(5000), redirect: 'error',
    });
    if (!response.ok) throw new Error('Usage storage unavailable');
    const payload = await response.json();
    if (payload.error) throw new Error('Usage storage unavailable');
    return payload.result;
  }
  async function usage(request, reserve = false) {
    const { time, resetsAt, configured, key } = context(request);
    let used;
    let allowed = true;
    if (configured) {
      const command = reserve ? ['EVAL', reserveScript, '1', key, String(Math.floor(resetsAt / 1000)), String(limit)] : ['GET', key];
      const result = await redis(command);
      if (reserve) {
        if (!Array.isArray(result) || result.length !== 2 || ![0, 1].includes(result[1])) throw new Error('Invalid usage response');
        [used, allowed] = result;
        allowed = Boolean(allowed);
      } else used = result === null ? 0 : Number(result);
    } else {
      for (const [entry, value] of memory) if (value.resetsAt <= time) memory.delete(entry);
      used = memory.get(key)?.used || 0;
      allowed = used < limit;
      if (reserve && allowed) { used++; memory.set(key, { used, resetsAt }); }
    }
    if (!Number.isInteger(used) || used < 0 || used > limit) throw new Error('Invalid usage response');
    return { used, limit, resetsAt, allowed: allowed && (reserve || used < limit) };
  }
  // Returns the reserved attempt when analysis never produced a result.
  usage.release = async function release(request) {
    const { resetsAt, configured, key } = context(request);
    let used;
    if (configured) {
      const result = await redis(['EVAL', releaseScript, '1', key]);
      used = result === null ? 0 : Number(result);
    } else {
      const entry = memory.get(key);
      used = Math.max(0, (entry?.used || 0) - 1);
      if (entry) memory.set(key, { used, resetsAt });
    }
    if (!Number.isInteger(used) || used < 0 || used > limit) throw new Error('Invalid usage response');
    return { used, limit, resetsAt, allowed: used < limit };
  };
  return usage;
}
