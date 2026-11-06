import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key, {
  auth: { flowType: 'pkce', detectSessionInUrl: false },
}) : null;

export function googleAvatarUrl(user) {
  try {
    const photo = new URL(user.user_metadata?.avatar_url || user.user_metadata?.picture);
    if (photo.protocol === 'https:' && !photo.username && !photo.password &&
      (photo.hostname === 'googleusercontent.com' || photo.hostname.endsWith('.googleusercontent.com'))) return photo.href;
  } catch { /* Use the default avatar when Google supplies no photo. */ }
  return null;
}
