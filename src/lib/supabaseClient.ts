import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined) ||
  '';

const supabaseAnonKey: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (typeof process !== 'undefined' ? process.env.SUPABASE_PUBLISHABLE_KEY : undefined) ||
  '';

/**
 * Validates Supabase configuration at runtime.
 * Returns only the missing variable NAMES, never their secret values.
 */
export function checkSupabaseConfig(): { isConfigured: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!supabaseUrl || supabaseUrl.trim() === '') {
    missing.push('SUPABASE_URL');
  }
  if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
    missing.push('SUPABASE_PUBLISHABLE_KEY');
  }
  return {
    isConfigured: missing.length === 0,
    missing,
  };
}

const status = checkSupabaseConfig();
if (!status.isConfigured && typeof console !== 'undefined') {
  console.warn(
    `[Supabase Client] Initialized with missing environment variable(s): ${status.missing.join(', ')}`
  );
}

/**
 * Official Supabase Client instance for client-side authentication,
 * PostgreSQL queries with Row Level Security (RLS), and Storage operations.
 * Uses only client-safe publishable credentials.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
