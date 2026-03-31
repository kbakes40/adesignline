/**
 * Facet counting for Supabase-backed listings uses denormalized columns on `product_listings`
 * (see `lib/catalog/listing-facet.ts` + `facet_multi` jsonb).
 * Server pages pass `facetBaseRows` from `getCollectionListingsPage` / `getSearchListingsPage`.
 */
export { computeFacetCountMapFromListings } from 'lib/catalog/listing-facet';
