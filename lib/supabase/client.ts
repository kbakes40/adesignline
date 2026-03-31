'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { supabaseUrl } from './env';

let browserClient: SupabaseClient | null = null;

/**
 * Browser-safe Supabase client (anon key). Use for auth/realtime when needed — never import service role here.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  }
  if (!browserClient) {
    browserClient = createClient(supabaseUrl(), key, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  }
  return browserClient;
}
