import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from Vite environment variables (from .env)
const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Fallback to localStorage if configured via admin settings UI and .env is not yet set
function resolveSupabaseCredentials(): { url: string; anonKey: string } {
  if (envUrl && envAnonKey) {
    return { url: envUrl, anonKey: envAnonKey };
  }

  if (typeof window !== 'undefined') {
    try {
      const savedUrl = localStorage.getItem('shadsodai_supabase_url') || '';
      const savedKey = localStorage.getItem('shadsodai_supabase_anon_key') || '';
      if (savedUrl && savedKey) {
        return { url: savedUrl.trim(), anonKey: savedKey.trim() };
      }
    } catch {
      // LocalStorage access might fail in restricted environments
    }
  }

  return { url: envUrl, anonKey: envAnonKey };
}

const credentials = resolveSupabaseCredentials();

export const supabaseUrl: string = credentials.url;
export const supabaseAnonKey: string = credentials.anonKey;

// Flag to check if valid Supabase connection parameters are present
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder.supabase.co')
);

// Fallback placeholder credentials to prevent runtime crashes during initial evaluation
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

/**
 * Global Supabase client instance initialized using environment variables.
 * Persists user session and automatically handles token refreshes.
 */
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : FALLBACK_URL,
  isSupabaseConfigured ? supabaseAnonKey : FALLBACK_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Helper to retrieve the current client or create a client with custom credentials.
 */
export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

export default supabase;
