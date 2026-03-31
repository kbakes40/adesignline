import { getProduct } from 'lib/bigcommerce';
import { NextResponse } from 'next/server';

/**
 * Full product payload for quick-view when the grid only has listing stubs (Supabase mode).
 * Same shape as PDP `getProduct` (includes variants, customization, images).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const product = await getProduct(decoded);
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ product });
}
