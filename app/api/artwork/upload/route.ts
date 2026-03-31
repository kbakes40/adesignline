import { sanitizeArtworkFilename } from 'lib/artwork-path';
import { setArtwork } from 'lib/artwork-memory-store';
import { inferArtworkMimeFromFilename, isAllowedArtworkMime, maxArtworkBytesServer } from 'lib/artwork-upload';
import { getSupabaseServiceRole } from 'lib/supabase/admin';
import { STORAGE_BUCKETS, normalizeStoragePath } from 'lib/supabase/storage';
import { createArtworkSignedUrl, defaultArtworkSignedTtlSeconds } from 'lib/supabase/storage-signing';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 365
  };
}

/**
 * POST multipart/form-data field `file`.
 * Private bucket `artwork-uploads` when SUPABASE_SERVICE_ROLE_KEY is set; otherwise in-memory dev fallback.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const maxBytes = maxArtworkBytesServer();
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File must be ${Math.floor(maxBytes / (1024 * 1024))}MB or smaller` },
      { status: 400 }
    );
  }

  const resolvedMime =
    (file.type && file.type.trim()) ||
    inferArtworkMimeFromFilename(file.name || '') ||
    '';

  if (!resolvedMime || !isAllowedArtworkMime(resolvedMime)) {
    return NextResponse.json(
      { error: 'Use PNG, JPG, SVG, WebP, or PDF for artwork files' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('artwork_session')?.value;
  const isNewSession = !sessionId;
  if (!sessionId) sessionId = crypto.randomUUID();

  const safeName = sanitizeArtworkFilename(file.name || 'artwork');
  const storagePath = `guest/${sessionId}/${Date.now()}-${safeName}`;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (serviceKey) {
    const admin = getSupabaseServiceRole();
    const objectPath = normalizeStoragePath(storagePath);
    const { error } = await admin.storage.from(STORAGE_BUCKETS.artworkUploads).upload(objectPath, buffer, {
      contentType: resolvedMime,
      upsert: false
    });
    if (error) {
      return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }

    let signed: { url: string; expiresAt: number };
    try {
      signed = await createArtworkSignedUrl(storagePath, {
        expiresIn: defaultArtworkSignedTtlSeconds()
      });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Could not create preview URL' },
        { status: 500 }
      );
    }

    const res = NextResponse.json({
      bucket: STORAGE_BUCKETS.artworkUploads,
      path: storagePath,
      storageKey: storagePath,
      filename: file.name || 'artwork',
      mimeType: resolvedMime,
      fileSize: file.size,
      url: signed.url,
      previewSignedUrl: signed.url,
      signedUrlExpiresAt: signed.expiresAt
    });
    if (isNewSession) {
      res.cookies.set('artwork_session', sessionId, sessionCookieOptions());
    }
    return res;
  }

  const storageKey = crypto.randomUUID();
  setArtwork(storageKey, {
    buffer,
    mimeType: resolvedMime,
    filename: file.name || 'artwork'
  });

  const origin = new URL(request.url).origin;
  const url = `${origin}/api/artwork/${storageKey}`;

  const res = NextResponse.json({
    bucket: null,
    path: null,
    storageKey,
    filename: file.name || 'artwork',
    mimeType: resolvedMime,
    fileSize: file.size,
    url,
    previewSignedUrl: url,
    signedUrlExpiresAt: null as number | null
  });
  if (isNewSession) {
    res.cookies.set('artwork_session', sessionId, sessionCookieOptions());
  }
  return res;
}
