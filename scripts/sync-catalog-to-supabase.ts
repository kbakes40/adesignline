/**
 * One-way sync: in-memory `products` (adesignline-data) → Supabase `product_listings` + `product_details`.
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: pnpm sync:supabase
 */
import { createClient } from '@supabase/supabase-js';
import { products } from '../lib/adesignline-data-products';
import { categorySlugForProduct } from '../lib/collection-category-filters';
import { productSlugForUrl } from '../lib/product-public-url';
import { inferFacetMulti, inferFacetNumbers } from '../lib/search-facet-engine';
import type { VercelProduct } from '../lib/bigcommerce/types';

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ');
}

function listingRowFromProduct(p: VercelProduct) {
  const slug = productSlugForUrl(p);
  const minP = Math.min(...p.variants.map((v) => Number.parseFloat(v.price.amount)));
  const maxP = Math.max(...p.variants.map((v) => Number.parseFloat(v.price.amount)));
  const nums = inferFacetNumbers(p);
  const multi = inferFacetMulti(p);
  const merch = categorySlugForProduct(p);

  const searchText = `${p.title} ${stripHtml(p.description)} ${p.tags.join(' ')}`.slice(0, 12000);

  return {
    id: p.id,
    handle: p.handle.replace(/^\//, ''),
    slug,
    title: p.title,
    sku: p.catalog?.supplierSku ?? null,
    brand: null,
    category: null,
    subcategory: null,
    thumbnail_url: p.featuredImage?.url ?? p.images[0]?.url ?? '',
    hero_url: p.images[0]?.url ?? p.featuredImage?.url ?? null,
    price_min: minP,
    price_max: maxP,
    currency_code: p.priceRange.maxVariantPrice.currencyCode,
    short_description: stripHtml(p.description).slice(0, 600) || null,
    min_qty: p.catalog?.minQuantity ?? null,
    tags: p.tags,
    facet_multi: multi,
    price_num: nums.price,
    production_days: nums.productionDays ?? null,
    min_qty_num: nums.minQty ?? p.catalog?.minQuantity ?? null,
    width_in: nums.widthIn ?? null,
    length_in: nums.lengthIn ?? null,
    height_in: nums.heightIn ?? null,
    updated_at: p.updatedAt,
    search_text: searchText,
    merch_category: merch ?? null
  };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const listings = products.map(listingRowFromProduct);
  const details = products.map((p) => ({ id: p.id, payload: p }));

  const batch = 150;
  for (let i = 0; i < listings.length; i += batch) {
    const slice = listings.slice(i, i + batch);
    const { error: le } = await supabase.from('product_listings').upsert(slice, { onConflict: 'id' });
    if (le) {
      console.error('listings upsert error', le);
      process.exit(1);
    }
    console.log(`Listings ${i + 1}–${Math.min(i + batch, listings.length)} / ${listings.length}`);
  }

  for (let i = 0; i < details.length; i += batch) {
    const slice = details.slice(i, i + batch);
    const { error: de } = await supabase.from('product_details').upsert(slice, { onConflict: 'id' });
    if (de) {
      console.error('details upsert error', de);
      process.exit(1);
    }
    console.log(`Details ${i + 1}–${Math.min(i + batch, details.length)} / ${details.length}`);
  }

  console.log('Done. Enable NEXT_PUBLIC_SUPABASE_CATALOG=1 in the app.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
