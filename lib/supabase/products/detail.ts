import type { VercelProduct } from 'lib/bigcommerce/types';
import { getSupabaseAnon } from 'lib/supabase/server';

export async function getProductDetailPayloadBySlug(slug: string): Promise<VercelProduct | null> {
  const supabase = getSupabaseAnon();
  const { data: listing, error: lErr } = await supabase
    .from('product_listings')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (lErr || !listing?.id) {
    const { data: byHandle } = await supabase.from('product_listings').select('id').eq('handle', slug).maybeSingle();
    if (!byHandle?.id) return null;
    return loadPayloadForId(byHandle.id);
  }
  return loadPayloadForId(listing.id);
}

export async function getProductDetailPayloadByHandle(handle: string): Promise<VercelProduct | null> {
  const normalized = handle.replace(/^\//, '');
  const supabase = getSupabaseAnon();
  const { data: listing } = await supabase.from('product_listings').select('id').eq('handle', normalized).maybeSingle();
  if (!listing?.id) {
    const { data: bySlug } = await supabase
      .from('product_listings')
      .select('id')
      .eq('slug', normalized.split('/').pop() ?? normalized)
      .maybeSingle();
    if (!bySlug?.id) return null;
    return loadPayloadForId(bySlug.id);
  }
  return loadPayloadForId(listing.id);
}

async function loadPayloadForId(id: string): Promise<VercelProduct | null> {
  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.from('product_details').select('payload').eq('id', id).maybeSingle();
  if (error || !data?.payload) return null;
  return data.payload as VercelProduct;
}
