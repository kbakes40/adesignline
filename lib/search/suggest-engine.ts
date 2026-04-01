import { navigationGroups } from 'lib/adesignline-data';
import { products } from 'lib/adesignline-data-products';
import type { ProductListingRow } from 'lib/catalog/product-listing-types';
import { isSupabaseCatalogEnabled } from 'lib/supabase/env';
import { getSupabaseServer } from 'lib/supabase/server';
import { resolvePublicProductThumbUrl } from 'lib/supabase/storage';
import type { VercelProduct } from 'lib/bigcommerce/types';
import { hyphenFold, normalizeQuery } from './normalize';
import {
  FEATURED_BRAND_SUGGESTIONS,
  FEATURED_CATEGORY_SUGGESTIONS,
  POPULAR_SEARCH_QUERIES
} from './popular';
import { listingMatchesQuery, productMatchesQuery, scoreVercelProduct, sortListingsByRelevance } from './rank';

export type SuggestProduct = {
  id: string;
  handle: string;
  title: string;
  brand: string | null;
  categoryLabel: string | null;
  thumbnailUrl: string;
  priceMin: number;
  priceMax: number;
  currencyCode: string;
};

export type SuggestLink = { label: string; href: string };
export type SuggestQueryItem = { label: string; q: string };

export type SuggestPayload = {
  query: string;
  products: SuggestProduct[];
  brands: SuggestLink[];
  categories: SuggestLink[];
  popular: SuggestQueryItem[];
  suggested: SuggestQueryItem[];
};

function mapRawToRow(r: Record<string, unknown>): ProductListingRow {
  return {
    id: String(r.id),
    handle: String(r.handle),
    slug: String(r.slug),
    title: String(r.title),
    sku: r.sku != null ? String(r.sku) : null,
    brand: r.brand != null ? String(r.brand) : null,
    category: r.category != null ? String(r.category) : null,
    subcategory: r.subcategory != null ? String(r.subcategory) : null,
    thumbnail_url: String(r.thumbnail_url),
    hero_url: r.hero_url != null ? String(r.hero_url) : null,
    price_min: Number(r.price_min),
    price_max: Number(r.price_max),
    currency_code: String(r.currency_code ?? 'USD'),
    short_description: r.short_description != null ? String(r.short_description) : null,
    min_qty: r.min_qty != null ? Number(r.min_qty) : null,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    facet_multi: (r.facet_multi as Record<string, string[]>) ?? {},
    price_num: Number(r.price_num),
    production_days: r.production_days != null ? Number(r.production_days) : null,
    min_qty_num: r.min_qty_num != null ? Number(r.min_qty_num) : null,
    width_in: r.width_in != null ? Number(r.width_in) : null,
    length_in: r.length_in != null ? Number(r.length_in) : null,
    height_in: r.height_in != null ? Number(r.height_in) : null,
    updated_at: String(r.updated_at),
    merch_category: r.merch_category != null ? String(r.merch_category) : null,
    search_text: r.search_text != null ? String(r.search_text) : null
  };
}

function rowToSuggestProduct(row: ProductListingRow): SuggestProduct {
  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    brand: row.brand,
    categoryLabel: row.merch_category ?? row.category ?? row.subcategory ?? null,
    thumbnailUrl: resolvePublicProductThumbUrl(row.thumbnail_url),
    priceMin: row.price_min,
    priceMax: row.price_max,
    currencyCode: row.currency_code
  };
}

function vercelToSuggestProduct(p: VercelProduct): SuggestProduct {
  const min = p.priceRange.minVariantPrice.amount;
  const max = p.priceRange.maxVariantPrice.amount;
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    brand: null,
    categoryLabel: null,
    thumbnailUrl: p.featuredImage?.url ?? '',
    priceMin: Number(min),
    priceMax: Number(max),
    currencyCode: p.priceRange.minVariantPrice.currencyCode
  };
}

async function fetchListingCandidates(q: string): Promise<ProductListingRow[]> {
  if (!isSupabaseCatalogEnabled()) return [];
  const safe = q.replace(/[%_\\]/g, '').slice(0, 96);
  if (safe.length < 2) return [];
  const pattern = `%${safe}%`;
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('product_listings')
    .select('*')
    .or(
      `title.ilike.${pattern},brand.ilike.${pattern},sku.ilike.${pattern},search_text.ilike.${pattern},category.ilike.${pattern},subcategory.ilike.${pattern}`
    )
    .limit(220);
  if (error) {
    console.error('[search/suggest]', error.message);
    return [];
  }
  return (data ?? []).map(mapRawToRow);
}

function memoryProductCandidates(q: string): VercelProduct[] {
  const nq = normalizeQuery(q);
  if (nq.length < 2) return [];
  return products.filter((prod) => productMatchesQuery(prod, q)).slice(0, 220);
}

function navBrandLinks(): SuggestLink[] {
  return navigationGroups.Brands.map((b) => ({ label: b.title, href: b.path }));
}

function navCategoryLinks(): SuggestLink[] {
  return navigationGroups.Categories.map((c) => ({ label: c.title, href: c.path }));
}

function filterLinks(links: SuggestLink[], q: string): SuggestLink[] {
  const n = normalizeQuery(q);
  if (!n) return [];
  return links.filter((l) => normalizeQuery(l.label).includes(n) || n.includes(normalizeQuery(l.label).slice(0, 3)));
}

function filterPopularQueries(q: string): SuggestQueryItem[] {
  const n = normalizeQuery(q);
  if (!n) return [];
  return POPULAR_SEARCH_QUERIES.filter(
    (p) => normalizeQuery(p.label).includes(n) || normalizeQuery(p.q).includes(n) || hyphenFold(p.q).includes(hyphenFold(n))
  ).map((p) => ({ label: p.label, q: p.q }));
}

export async function buildSuggestPayload(rawQuery: string): Promise<SuggestPayload> {
  const query = rawQuery.trim();
  const nq = normalizeQuery(query);

  if (!nq) {
    return {
      query,
      products: [],
      brands: [...FEATURED_BRAND_SUGGESTIONS],
      categories: [...FEATURED_CATEGORY_SUGGESTIONS],
      popular: POPULAR_SEARCH_QUERIES.map((p) => ({ label: p.label, q: p.q })),
      suggested: POPULAR_SEARCH_QUERIES.slice(0, 6).map((p) => ({ label: p.label, q: p.q }))
    };
  }

  let productRows: ProductListingRow[] = [];
  if (isSupabaseCatalogEnabled()) {
    productRows = await fetchListingCandidates(query);
    productRows = productRows.filter((r) => listingMatchesQuery(r, query));
    productRows = sortListingsByRelevance(productRows, query).slice(0, 8);
  } else {
    const mem = memoryProductCandidates(query);
    const sorted = [...mem].sort((a, b) => scoreVercelProduct(b, query) - scoreVercelProduct(a, query)).slice(0, 8);
    return {
      query,
      products: sorted.map(vercelToSuggestProduct),
      brands: filterLinks(navBrandLinks(), query).slice(0, 6),
      categories: filterLinks(navCategoryLinks(), query).slice(0, 6),
      popular: filterPopularQueries(query).slice(0, 8),
      suggested: filterPopularQueries(query).slice(0, 8)
    };
  }

  const productsOut = productRows.map(rowToSuggestProduct);

  return {
    query,
    products: productsOut,
    brands: filterLinks(navBrandLinks(), query).slice(0, 6),
    categories: filterLinks(navCategoryLinks(), query).slice(0, 6),
    popular: filterPopularQueries(query).slice(0, 8),
    suggested: filterPopularQueries(query).slice(0, 8)
  };
}
