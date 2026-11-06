import { signCloud } from './catalogStore.js';

export const creatorArtworkId = id => `schedsnap/creator/${id}`;
export const cloudImageApi = env => `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image`;
export const cloudTimestamp = () => String(Math.floor(Date.now() / 1000));

export function signedArtworkParams(params, env) {
  return { ...params, api_key: env.CLOUDINARY_API_KEY, signature: signCloud(params, env) };
}

export function creatorArtworkPreview(id, env) {
  const now = Number(cloudTimestamp());
  const query = new URLSearchParams(signedArtworkParams({
    public_id: creatorArtworkId(id), format: 'jpg', type: 'authenticated',
    timestamp: String(now), expires_at: String(now + 900),
  }, env));
  return `${cloudImageApi(env)}/download?${query}`;
}
