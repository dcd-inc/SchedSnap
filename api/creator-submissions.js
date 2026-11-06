import { creatorAvatarKeys } from '../shared/creatorAvatars.js';
import { randomUUID } from 'node:crypto';
import { connectCreatorDatabase } from '../server/creatorDatabase.js';
import { z } from 'zod';
import { cloudConfigured } from '../server/catalogStore.js';
import { cloudImageApi, cloudTimestamp, creatorArtworkId, creatorArtworkPreview, signedArtworkParams } from '../server/creatorArtwork.js';
import { MAX_IMAGE_BYTES } from '../shared/uploadLimits.js';

const limit = 20;
const maxUploadsPerHour = 12;
const metadata = {
  title: z.string().trim().min(1).max(80),
  rights: z.literal(true),
  aiGenerated: z.boolean(),
};
const id = z.uuid();
const image = z.string().max(4 * Math.ceil(MAX_IMAGE_BYTES / 3));
const avatarValue = z.union([
  z.enum(creatorAvatarKeys),
  z.string().max(300000).regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/),
]).nullable().optional();
const mutation = z.discriminatedUnion('action', [
  z.strictObject({ action: z.literal('profile'), creatorName: z.string().trim().min(1).max(60).optional(), avatar: avatarValue }),
  z.strictObject({ action: z.literal('create'), id, ...metadata, image }),
  z.strictObject({ action: z.literal('update'), id, revision: id, ...metadata, image: image.optional() }),
  z.strictObject({ action: z.literal('delete'), id, revision: id }),
]);

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function imageBytes(value) {
  const bytes = Buffer.from(value, 'base64');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES || bytes.toString('base64') !== value) {
    throw new RequestError(400, 'Choose a valid image under 3 MB after cropping.');
  }
  const jpeg = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (!jpeg && !png && !webp) throw new RequestError(400, 'Choose a JPG, PNG, or WebP image.');
  return { bytes, format: jpeg ? 'jpeg' : png ? 'png' : 'webp' };
}

export function createCreatorSubmissionsHandler({ env = process.env, fetcher = fetch, db } = {}) {
  let sql = db;
  const base = () => cloudImageApi(env);
  const signed = params => signedArtworkParams(params, env);
  function view(row) {
    return {
      id: row.id, title: row.title, artist: row.artist, status: row.status,
      aiGenerated: row.ai_generated ?? null,
      reviewNote: row.review_note, updatedAt: row.updated_at, revision: row.revision,
      preview: creatorArtworkPreview(row.artwork_id, env),
    };
  }

  async function upload(artworkId, { bytes, format }) {
    const fields = signed({
      public_id: creatorArtworkId(artworkId), type: 'authenticated', timestamp: cloudTimestamp(),
      allowed_formats: 'jpg,jpeg,png,webp', overwrite: 'false', format: 'jpg',
      transformation: 'c_limit,h_2400,w_1080/f_jpg,q_90',
    });
    const body = new FormData();
    for (const [key, value] of Object.entries(fields)) body.set(key, value);
    body.set('file', new Blob([bytes], { type: `image/${format}` }), `artwork.${format}`);
    const response = await fetcher(`${base()}/upload`, { method: 'POST', body, signal: AbortSignal.timeout(20000) });
    if (response.status === 400 || response.status === 415 || response.status === 422) {
      throw new RequestError(400, 'This image could not be processed. Try a different JPG, PNG, or WebP.');
    }
    if (!response.ok) throw new Error('Artwork upload failed.');
    const result = await response.json();
    if (result.type !== 'authenticated' || result.public_id !== creatorArtworkId(artworkId) || result.format !== 'jpg') {
      throw new Error('Unexpected artwork upload response.');
    }
    if (!result.width || !result.height || Math.abs(result.width / result.height - 0.45) > 0.01) {
      throw new RequestError(400, 'Crop the artwork to fit the phone preview.');
    }
  }

  async function cleanRetired(owner) {
    try {
      const rows = await sql`select id from schedsnap_creator.artwork
        where owner_id = ${owner} and delete_after <= now() and deleted_at is null limit 8`;
      await Promise.all(rows.map(async row => {
        const body = new URLSearchParams(signed({ public_id: creatorArtworkId(row.id), type: 'authenticated', timestamp: cloudTimestamp() }));
        const response = await fetcher(`${base()}/destroy`, { method: 'POST', body, signal: AbortSignal.timeout(5000) });
        if (!response.ok || !['ok', 'not found'].includes((await response.json()).result)) return;
        await sql`update schedsnap_creator.artwork set deleted_at = now() where id = ${row.id}`;
      }));
      await sql`delete from schedsnap_creator.artwork where owner_id = ${owner}
        and deleted_at is not null and created_at < now() - interval '1 hour'`;
    } catch {
      // The durable deletion marker lets the owner's next visit retry cleanup.
    }
  }

  return async (request, response) => {
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const fail = (status, message) => response.status(status).json({ error: { message } });
    if (!['GET', 'POST'].includes(request.method)) return fail(405, 'Method not allowed.');
    const authorization = request.headers.authorization;
    if (typeof authorization !== 'string' || !/^Bearer [\w.-]{1,8192}$/.test(authorization)) {
      return fail(401, 'Sign in with Google to manage your designs.');
    }
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY || (!db && !env.SUPABASE_DB_URL) || !cloudConfigured(env)) {
      return fail(503, 'Creator submissions are temporarily unavailable.');
    }
    try {
      const auth = await fetcher(new URL('/auth/v1/user', env.VITE_SUPABASE_URL), {
        headers: { authorization, apikey: env.VITE_SUPABASE_PUBLISHABLE_KEY }, signal: AbortSignal.timeout(5000),
      });
      if (auth.status === 401 || auth.status === 403) return fail(401, 'Your session expired. Sign in again.');
      if (!auth.ok) throw new Error('Could not verify the session.');
      const user = await auth.json();
      const owner = id.parse(user.id);
      if (!user.app_metadata?.providers?.includes('google') && user.app_metadata?.provider !== 'google') {
        return fail(403, 'Use a Google account to submit designs.');
      }
      sql ??= connectCreatorDatabase(env);

      const parsed = request.method === 'POST' ? mutation.safeParse(request.body) : null;
      if (parsed && !parsed.success) return fail(400, 'Check your design details and confirm that you have permission to share the artwork.');
      const change = parsed?.data;
      if (change?.action === 'profile' && typeof change.avatar === 'string' && change.avatar.startsWith('data:')) {
        const { bytes } = imageBytes(change.avatar.slice(change.avatar.indexOf(',') + 1));
        if (bytes.length > 200 * 1024) throw new RequestError(400, 'Choose a profile photo under 200 KB.');
      }
      let creatorName;
      let avatar;
      if (request.method === 'GET' || change.action !== 'delete') {
        const email = user.email_confirmed_at ? user.email ?? null : null;
        const signedIn = user.last_sign_in_at ?? null;
        await sql`insert into schedsnap_creator.profiles (user_id, verified_email, last_sign_in_at)
          values (${owner}, ${email}, ${signedIn})
          on conflict (user_id) do update set verified_email = excluded.verified_email,
            last_sign_in_at = greatest(profiles.last_sign_in_at, excluded.last_sign_in_at)
          where profiles.verified_email is distinct from excluded.verified_email
            or profiles.last_sign_in_at < excluded.last_sign_in_at
            or (profiles.last_sign_in_at is null and excluded.last_sign_in_at is not null)`;
        if (change?.action === 'profile' && (change.creatorName || change.avatar !== undefined)) {
          await sql`update schedsnap_creator.profiles
            set creator_name = coalesce(${change.creatorName ?? null}::text, creator_name),
              avatar_key = case when ${change.avatar !== undefined}::boolean then ${change.avatar ?? null}::text else avatar_key end
            where user_id = ${owner}`;
        }
        const [profile] = await sql`select creator_name, avatar_key from schedsnap_creator.profiles where user_id = ${owner}`;
        creatorName = profile?.creator_name ?? null;
        avatar = profile?.avatar_key ?? null;
      }
      if (change?.action === 'profile') return response.status(200).json({ creatorName, avatar });
      if (change?.action !== 'delete' && !creatorName) return fail(409, 'Choose a creator name first.');

      if (request.method === 'GET') {
        const rows = await sql`select * from schedsnap_creator.submissions where owner_id = ${owner}
          order by updated_at desc limit ${limit}`;
        await cleanRetired(owner);
        return response.status(200).json({ submissions: rows.map(view) });
      }

      const bytes = change.image ? imageBytes(change.image) : null;

      async function lockOwner(tx) {
        await tx`select pg_advisory_xact_lock(hashtextextended(${owner}, 0))`;
      }

      async function findEditable(tx) {
        const [row] = await tx`select * from schedsnap_creator.submissions where id = ${change.id} and owner_id = ${owner} for update`;
        if (change.action === 'create') return row;
        if (!row) throw new RequestError(404, 'This submission could not be found.');
        if (row.revision !== change.revision) throw new RequestError(409, 'This design changed. Open My submissions and try again.');
        if (row.status === 'publishing') throw new RequestError(409, 'This design is being published. Check My submissions again shortly.');
        if (row.status === 'published') throw new RequestError(409, 'This design has been published. Contact SchedSnap to request changes.');
        return row;
      }

      const artworkId = bytes ? randomUUID() : null;
      if (artworkId) {
        const existing = await sql.begin(async tx => {
          await lockOwner(tx);
          const row = await findEditable(tx);
          if (change.action === 'create' && row) return row;
          if (change.action === 'create') {
            const [{ count }] = await tx`select count(*) from schedsnap_creator.submissions where owner_id = ${owner}`;
            if (Number(count) >= limit) throw new RequestError(409, 'You can have up to 20 submissions. Delete one before submitting another.');
          }
          const [{ count }] = await tx`select count(*) from schedsnap_creator.artwork
            where owner_id = ${owner} and created_at > now() - interval '1 hour'`;
          if (Number(count) >= maxUploadsPerHour) throw new RequestError(429, 'You have uploaded several designs. Try again in an hour.');
          await tx`insert into schedsnap_creator.artwork (id, owner_id) values (${artworkId}, ${owner})`;
          return null;
        });
        if (existing) return response.status(200).json({ submission: view(existing) });
        await upload(artworkId, bytes);
      }

      const submission = await sql.begin(async tx => {
        await lockOwner(tx);
        const row = await findEditable(tx);
        if (change.action === 'create' && row) return row;
        if (change.action === 'create') {
          const [{ count }] = await tx`select count(*) from schedsnap_creator.submissions where owner_id = ${owner}`;
          if (Number(count) >= limit) throw new RequestError(409, 'You can have up to 20 submissions. Delete one before submitting another.');
        }
        if (artworkId) {
          const attached = await tx`update schedsnap_creator.artwork set delete_after = null
            where id = ${artworkId} and delete_after > now() returning id`;
          if (!attached.length) throw new RequestError(409, 'The upload expired. Submit your design again.');
        }
        if (row && (artworkId || change.action === 'delete')) {
          await tx`update schedsnap_creator.artwork set delete_after = now() where id = ${row.artwork_id}`;
        }
        if (change.action === 'delete') {
          await tx`delete from schedsnap_creator.submissions where id = ${row.id} and owner_id = ${owner}`;
          return null;
        }
        const revision = randomUUID();
        const [saved] = row
          ? await tx`update schedsnap_creator.submissions set title = ${change.title}, artist = ${creatorName},
              artwork_id = ${artworkId ?? row.artwork_id}, ai_generated = ${change.aiGenerated}, status = 'in_review', review_note = null,
              revision = ${revision}, updated_at = now(), rights_accepted_at = now()
              where id = ${row.id} and owner_id = ${owner} returning *`
          : await tx`insert into schedsnap_creator.submissions (id, owner_id, artwork_id, title, artist, revision, ai_generated)
              values (${change.id}, ${owner}, ${artworkId}, ${change.title}, ${creatorName}, ${revision}, ${change.aiGenerated}) returning *`;
        return saved;
      });
      await cleanRetired(owner);
      return response.status(200).json({ submission: submission ? view(submission) : null });
    } catch (error) {
      if (error instanceof RequestError) return fail(error.status, error.message);
      return fail(503, 'Could not reach creator submissions. Please try again.');
    }
  };
}

export default createCreatorSubmissionsHandler();
