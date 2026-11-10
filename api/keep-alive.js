import { timingSafeEqual } from 'node:crypto';
import { connectCreatorDatabase } from '../server/creatorDatabase.js';

export function createKeepAliveHandler({ env = process.env, connect = connectCreatorDatabase } = {}) {
  return async function keepAlive(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET');
      return response.status(405).json({ error: 'Method not allowed.' });
    }
    if (!env.CRON_SECRET || env.CRON_SECRET.length < 32) {
      return response.status(503).json({ error: 'Keep-alive is not configured.' });
    }
    const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
    const supplied = Buffer.from(request.headers?.authorization || '');
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      return response.status(401).json({ error: 'Unauthorized.' });
    }
    if (!env.SUPABASE_DB_URL) {
      return response.status(503).json({ error: 'Keep-alive is not configured.' });
    }
    let sql;
    try {
      sql = connect(env);
      await sql`select 1 from schedsnap_creator.submissions limit 1`;
      return response.status(200).json({ ok: true });
    } catch {
      return response.status(503).json({ error: 'Database check failed.' });
    } finally {
      if (sql) await sql.end({ timeout: 1 }).catch(() => {});
    }
  };
}

export default createKeepAliveHandler();
