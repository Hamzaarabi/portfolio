import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://edplthwtzxdrqitdupvi.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CFBttMEsLMZEmuoPDowNIw_dMxIU9ed';

function normalizeSupabaseUrl(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '');
  return raw.replace(/\/rest\/v1$/i, '');
}

export const SUPABASE_URL = normalizeSupabaseUrl(
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
);

export const SUPABASE_PUBLISHABLE_KEY = String(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY
).trim();

export const ADMIN_EMAIL = String(
  import.meta.env.VITE_ADMIN_EMAIL || 'arabihamzaaa@gmail.com'
).trim().toLowerCase();

export const SUPABASE_PROJECT_REF = (() => {
  try {
    return new URL(SUPABASE_URL).hostname.split('.')[0] || '';
  } catch {
    return '';
  }
})();

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_PUBLISHABLE_KEY &&
  !SUPABASE_PUBLISHABLE_KEY.includes('your-') &&
  !SUPABASE_PUBLISHABLE_KEY.startsWith('sb_secret_') &&
  !SUPABASE_PUBLISHABLE_KEY.includes('service_role')
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // The site uses HashRouter, so OAuth/magic-link tokens in the URL
        // hash would be mistaken for application routes.
        detectSessionInUrl: false,
        storageKey: 'hamza-portfolio-supabase-auth-v1',
      },
      realtime: {
        params: { eventsPerSecond: 5 },
      },
    })
  : null;

export function isAdminUser(user) {
  if (!user?.email) return false;
  return user.email.trim().toLowerCase() === ADMIN_EMAIL || user.app_metadata?.role === 'admin';
}

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then rebuild.');
  }
  return supabase;
}

export function supabaseErrorMessage(error, fallback = 'Supabase request failed.') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  return error.message || error.details || error.hint || fallback;
}
