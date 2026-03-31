import { getArtwork } from 'lib/artwork-memory-store';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = getArtwork(id);
  if (!meta) {
    return NextResponse.json({ error: 'Artwork not found or expired' }, { status: 404 });
  }

  return new NextResponse(meta.buffer, {
    headers: {
      'Content-Type': meta.mimeType,
      'Content-Disposition': `inline; filename="${encodeURIComponent(meta.filename)}"`,
      'Cache-Control': 'private, max-age=300'
    }
  });
}
