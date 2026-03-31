import { listingRowToCardProduct } from 'lib/catalog/listing-mapper';
import type { ProductListingRow } from 'lib/catalog/product-listing-types';
import { isSupabaseCatalogEnabled } from 'lib/supabase/env';
import { getCollectionListingsPage, getSearchListingsPage } from 'lib/supabase/products/listing';
import type { VercelProduct } from 'lib/bigcommerce/types';
import type { FacetFilterState } from 'lib/search-facet-engine';
import type { VercelSortKeys } from 'lib/constants';
import { COLLECTION_PAGE_SIZE, paginateProducts } from 'lib/collection-pagination';
import { applyFacetFilters } from 'lib/search-facet-engine';

export type CollectionPageBundle =
  | {
      source: 'supabase';
      cardProducts: VercelProduct[];
      facetBaseRows: ProductListingRow[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }
  | {
      source: 'memory';
      products: VercelProduct[];
      facetBasePool: VercelProduct[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };

export async function loadCollectionPage(args: {
  collection: string;
  sortKey: keyof typeof VercelSortKeys;
  reverse: boolean;
  category?: string;
  query?: string;
  facetState: FacetFilterState;
  page: number;
  /** Fallback loader — full in-memory list, then paginate (legacy). */
  loadFullList: () => Promise<VercelProduct[]>;
}): Promise<CollectionPageBundle> {
  if (isSupabaseCatalogEnabled()) {
    const r = await getCollectionListingsPage({
      collection: args.collection,
      sortKey: args.sortKey,
      reverse: args.reverse,
      category: args.category,
      query: args.query,
      facetState: args.facetState,
      page: args.page,
      pageSize: COLLECTION_PAGE_SIZE
    });
    return {
      source: 'supabase',
      cardProducts: r.rows.map(listingRowToCardProduct),
      facetBaseRows: r.facetBaseRows,
      total: r.total,
      page: r.page,
      pageSize: r.pageSize,
      totalPages: r.totalPages
    };
  }

  const all = await args.loadFullList();
  const filtered = applyFacetFilters(all, args.facetState);
  const { items, total, page, pageSize, totalPages } = paginateProducts(filtered, args.page);
  return {
    source: 'memory',
    products: items,
    facetBasePool: all,
    total,
    page,
    pageSize,
    totalPages
  };
}

export async function loadSearchPage(args: {
  query?: string;
  sortKey: keyof typeof VercelSortKeys;
  reverse: boolean;
  facetState: FacetFilterState;
  page: number;
  loadFullList: () => Promise<VercelProduct[]>;
}): Promise<CollectionPageBundle> {
  if (isSupabaseCatalogEnabled()) {
    const r = await getSearchListingsPage({
      query: args.query,
      sortKey: args.sortKey,
      reverse: args.reverse,
      facetState: args.facetState,
      page: args.page,
      pageSize: COLLECTION_PAGE_SIZE
    });
    return {
      source: 'supabase',
      cardProducts: r.rows.map(listingRowToCardProduct),
      facetBaseRows: r.facetBaseRows,
      total: r.total,
      page: r.page,
      pageSize: r.pageSize,
      totalPages: r.totalPages
    };
  }

  const all = await args.loadFullList();
  const filtered = applyFacetFilters(all, args.facetState);
  const { items, total, page, pageSize, totalPages } = paginateProducts(filtered, args.page);
  return {
    source: 'memory',
    products: items,
    facetBasePool: all,
    total,
    page,
    pageSize,
    totalPages
  };
}
