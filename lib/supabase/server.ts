import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { isSupabaseCatalogEnabled, isSupabaseClientConfigured, supabaseUrl } from './env';

let serverAnonClient: SupabaseClient | null = null;

/**
 * Server-side anon Supabase client (RLS). Use for catalog queries and other anon API access.
 */
export function getSupabaseServer(): SupabaseClient {
  if (!isSupabaseClientConfigured()) {
    throw new Error(
      'Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  if (!serverAnonClient) {
    serverAnonClient = createClient(supabaseUrl(), key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return serverAnonClient;
}

/** Catalog DB reads — opt-in via NEXT_PUBLIC_SUPABASE_CATALOG=1 */
export function getSupabaseAnon(): SupabaseClient {
  if (!isSupabaseCatalogEnabled()) {
    throw new Error('Supabase catalog is not enabled');
  }
  return getSupabaseServer();
}
