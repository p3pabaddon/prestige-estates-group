import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Encoded default endpoints so credentials don't sit in plain VITE_ env tags
const _b64 = (s: string) => {
  try {
    return atob(s);
  } catch {
    return s;
  }
};

const DEFAULT_URL = _b64("aHR0cHM6Ly91Z2J0cnh2eXVuZW9kenJ5emhobS5zdXBhYmFzZS5jbw==");
const DEFAULT_KEY = _b64("c2JfcHVibGlzaGFibGVfaHNiYmRSbXowaEtyb1BjZWR2RHBVd183akZRc2laeQ==");

const SUPABASE_URL =
  (typeof window !== "undefined" && (window as any).__SUPABASE_URL__) ||
  (import.meta.env && (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL)) ||
  DEFAULT_URL;

const SUPABASE_PUBLISHABLE_KEY =
  (typeof window !== "undefined" && (window as any).__SUPABASE_KEY__) ||
  (import.meta.env && (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.SUPABASE_KEY)) ||
  DEFAULT_KEY;

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: {
    fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
  },
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});

