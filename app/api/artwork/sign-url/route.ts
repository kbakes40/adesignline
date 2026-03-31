import { isGuestArtworkPathForSession } from 'lib/artwork-path';
import { createArtworkSignedUrl, defaultArtworkSignedTtlSeconds } from 'lib/supabase/storage-signing';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST { path } — refresh signed read URL for an object in private `artwork-uploads`.
 * Requires matching `artwork_session` cookie (same browser session as upload).
 */
export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json({ error: 'Signed URLs require Supabase storage' }, { status: 503 });
  }

  let body: { path?: string };
  try {
    body = (await request.json()) as { path?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const path = body.path?.trim();
  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get('artwork_session')?.value;
  if (!sessionId) {
    return NextResponse.json({ error: 'Session required for artwork preview' }, { status: 401 });
  }

  if (!isGuestArtworkPathForSession(path, sessionId)) {
    return NextResponse.json({ error: 'Invalid artwork path' }, { status: 403 });
  }

  try {
    const { url, expiresAt } = await createArtworkSignedUrl(path, {
      expiresIn: defaultArtworkSignedTtlSeconds()
    });
    return NextResponse.json({ url, expiresAt });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not sign URL' },
      { status: 500 }
    );
  }
}
