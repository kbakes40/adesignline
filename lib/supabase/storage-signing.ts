import { getSupabaseServiceRole } from 'lib/supabase/admin';
import { STORAGE_BUCKETS, normalizeStoragePath } from 'lib/supabase/storage';

export function defaultArtworkSignedTtlSeconds(): number {
  const n = Number(process.env.ARTWORK_SIGNED_URL_TTL_SECONDS);
  if (Number.isFinite(n) && n >= 60 && n <= 60 * 60 * 24 * 7) return Math.floor(n);
  return 3600;
}

/** Server-only: signed read URL for private artwork-uploads objects. */
export async function createArtworkSignedUrl(
  path: string,
  options?: { expiresIn?: number }
): Promise<{ url: string; expiresAt: number }> {
  const admin = getSupabaseServiceRole();
  const clean = normalizeStoragePath(path);
  const expiresIn = options?.expiresIn ?? defaultArtworkSignedTtlSeconds();
  const { data, error } = await admin.storage
    .from(STORAGE_BUCKETS.artworkUploads)
    .createSignedUrl(clean, expiresIn);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error('Signed URL was not returned');
  return { url: data.signedUrl, expiresAt: Date.now() + expiresIn * 1000 };
}
