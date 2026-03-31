import { buildSuggestPayload } from 'lib/search/suggest-engine';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  try {
    const payload = await buildSuggestPayload(q);
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=120'
      }
    });
  } catch (e) {
    console.error('[api/search/suggest]', e);
    return NextResponse.json(
      { query: q, products: [], brands: [], categories: [], popular: [], suggested: [] },
      { status: 200 }
    );
  }
}
