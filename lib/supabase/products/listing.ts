import { applyFacetFiltersToListingRows } from 'lib/catalog/listing-facet';
import type { CollectionListingQuery, ProductListingRow } from 'lib/catalog/product-listing-types';
import { catalogCategorySlugs, collectionsWithCatalogCategoryParam } from 'lib/collection-category-filters';
import { COLLECTION_PAGE_SIZE } from 'lib/collection-pagination';
import { VercelSortKeys } from 'lib/constants';
import { nikeCategoryTag, type NikeCategorySlug } from 'lib/nike-catalog-data';
import { listingMatchesQuery, sortListingsByRelevance } from 'lib/search/rank';
import type { FacetFilterState } from 'lib/search-facet-engine';
import { isEmptyFacetState } from 'lib/search-facet-engine';
import { getSupabaseAnon } from 'lib/supabase/server';

const MAX_LISTING_SCAN = 50_000;

const nikeCategorySlugs = new Set<string>([
  'apparel-caps-hats',
  'awards-recognition',
  'bags-totes',
  'outdoors-sports'
]);

function mapRow(r: Record<string, unknown>): ProductListingRow {
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

async function fetchRawListingsForCollection(collection: string): Promise<Record<string, unknown>[]> {
  const supabase = getSupabaseAnon();
  const { data, error } = await supabase
    .from('product_listings')
    .select('*')
    .contains('tags', [collection])
    .limit(MAX_LISTING_SCAN);
  if (error) throw error;
  return data ?? [];
}

async function fetchRawListingsAll(): Promise<Record<string, unknown>[]> {
  const supabase = getSupabaseAnon();
  const { data, error } = await supabase.from('product_listings').select('*').limit(MAX_LISTING_SCAN);
  if (error) throw error;
  return data ?? [];
}


/** Apply collection-specific category filters (Nike, merch buckets) — same semantics as getCollectionProducts. */
function applyCollectionNarrowing(
  rows: ProductListingRow[],
  collection: string,
  category?: string
): ProductListingRow[] {
  let out = rows;
  if (collection === 'nike' && category && nikeCategorySlugs.has(category)) {
    const tag = nikeCategoryTag(category as NikeCategorySlug);
    out = out.filter((r) => r.tags.includes(tag));
  }
  if (
    collectionsWithCatalogCategoryParam.has(collection) &&
    category &&
    catalogCategorySlugs.has(category)
  ) {
    out = out.filter((r) => {
      if (r.merch_category) return r.merch_category === category;
      return false;
    });
  }
  return out;
}

function sortListingRows(
  rows: ProductListingRow[],
  sortKey: keyof typeof VercelSortKeys = 'RELEVANCE',
  reverse = false
): ProductListingRow[] {
  return [...rows].sort((a, b) => {
    switch (sortKey) {
      case 'CREATED_AT': {
        const cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        return reverse ? -cmp : cmp;
      }
      case 'PRICE': {
        const cmp = a.price_num - b.price_num;
        return reverse ? -cmp : cmp;
      }
      case 'BEST_SELLING':
      case 'RELEVANCE':
      default:
        return a.title.localeCompare(b.title);
    }
  });
}

export type ListingPageResult = {
  rows: ProductListingRow[];
  /** Same filtered pool used for facet counts (slim rows). */
  facetBaseRows: ProductListingRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getCollectionListingsPage(q: CollectionListingQuery): Promise<ListingPageResult> {
  const raw = await fetchRawListingsForCollection(q.collection);
  let rows = raw.map(mapRow);
  const queryStr = q.query?.trim() ?? '';
  rows = rows.filter((r) => listingMatchesQuery(r, queryStr));
  rows = applyCollectionNarrowing(rows, q.collection, q.category);

  /** Pool for facet counts: narrowed by collection + query + category, not by facet UI. */
  const facetBaseRows = rows;
  const filtered = applyFacetFiltersToListingRows(
    rows,
    isEmptyFacetState(q.facetState ?? { multi: {} }) ? undefined : q.facetState
  );
  const total = filtered.length;
  const sorted =
    (q.sortKey ?? 'RELEVANCE') === 'RELEVANCE' && queryStr
      ? sortListingsByRelevance(filtered, queryStr)
      : sortListingRows(filtered, q.sortKey ?? 'RELEVANCE', q.reverse ?? false);
  const pageSize = q.pageSize || COLLECTION_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, q.page), totalPages);
  const start = (page - 1) * pageSize;
  const pageSlice = sorted.slice(start, start + pageSize);

  return {
    rows: pageSlice,
    facetBaseRows,
    total,
    page,
    pageSize,
    totalPages
  };
}

/** Global search listing page (all products), same as /search without collection tag. */
export async function getSearchListingsPage(params: {
  query?: string;
  sortKey?: keyof typeof VercelSortKeys;
  reverse?: boolean;
  facetState?: FacetFilterState;
  page: number;
  pageSize?: number;
}): Promise<ListingPageResult> {
  const raw = await fetchRawListingsAll();
  let rows = raw.map(mapRow);
  const queryStr = params.query?.trim() ?? '';
  rows = rows.filter((r) => listingMatchesQuery(r, queryStr));
  const facetBaseRows = rows;
  const filtered = applyFacetFiltersToListingRows(
    rows,
    isEmptyFacetState(params.facetState ?? { multi: {} }) ? undefined : params.facetState
  );
  const total = filtered.length;
  const sorted =
    (params.sortKey ?? 'RELEVANCE') === 'RELEVANCE' && queryStr
      ? sortListingsByRelevance(filtered, queryStr)
      : sortListingRows(filtered, params.sortKey ?? 'RELEVANCE', params.reverse ?? false);
  const pageSize = params.pageSize || COLLECTION_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, params.page), totalPages);
  const start = (page - 1) * pageSize;

  return {
    rows: sorted.slice(start, start + pageSize),
    facetBaseRows,
    total,
    page,
    pageSize,
    totalPages
  };
}
