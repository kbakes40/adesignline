/**
 * URL + anon key present (browser and server Supabase clients, public asset URL helpers).
 */
export function isSupabaseClientConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/**
 * Supabase catalog is opt-in so local/dev without DB keeps using in-memory catalog.
 * Set NEXT_PUBLIC_SUPABASE_CATALOG=1 and URL + anon key to enable.
 */
export function isSupabaseCatalogEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_CATALOG === '1' &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/** Returns null when unset (safe for Edge / optional Storage URLs). */
export function trySupabaseUrl(): string | null {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!u) return null;
  return u.replace(/\/$/, '');
}

export function supabaseUrl(): string {
  const u = trySupabaseUrl();
  if (!u) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  return u;
}
