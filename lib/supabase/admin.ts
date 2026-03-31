import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { supabaseUrl } from './env';

let serviceClient: SupabaseClient | null = null;

/**
 * Service role client — server-only (Route Handlers, Server Actions).
 * Use for Storage uploads and signed URLs on private buckets. Never import in client components.
 */
export function getSupabaseServiceRole(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('Service role Supabase client is server-only');
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl(), key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return serviceClient;
}
