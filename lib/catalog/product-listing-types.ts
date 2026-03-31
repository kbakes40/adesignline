import type { FacetFilterState } from 'lib/search-facet-engine';

/** Row shape returned from `product_listings` (+ facet fields for counts). */
export type ProductListingRow = {
  id: string;
  handle: string;
  slug: string;
  title: string;
  sku: string | null;
  brand: string | null;
  category: string | null;
  subcategory: string | null;
  thumbnail_url: string;
  hero_url: string | null;
  price_min: number;
  price_max: number;
  currency_code: string;
  short_description: string | null;
  min_qty: number | null;
  tags: string[];
  facet_multi: Record<string, string[]>;
  price_num: number;
  production_days: number | null;
  min_qty_num: number | null;
  width_in: number | null;
  length_in: number | null;
  height_in: number | null;
  updated_at: string;
  /** Inferred merch bucket for Carhartt / brands sidebar (`merch-apparel`, …) */
  merch_category: string | null;
  search_text?: string | null;
};

export type CollectionListingQuery = {
  collection: string;
  sortKey?: 'RELEVANCE' | 'CREATED_AT' | 'BEST_SELLING' | 'PRICE';
  reverse?: boolean;
  category?: string;
  query?: string;
  facetState?: FacetFilterState;
  page: number;
  pageSize?: number;
};
