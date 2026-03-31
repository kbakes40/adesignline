import type { ProductListingRow } from 'lib/catalog/product-listing-types';
import { SEARCH_MULTI_FACET_GROUPS } from 'lib/search-facet-data';
import {
  applyFacetFilters,
  computeFacetCountMap,
  isEmptyFacetState,
  type FacetFilterState
} from 'lib/search-facet-engine';
import type { VercelProduct } from 'lib/bigcommerce/types';

function listingMatchesRanges(row: ProductListingRow, state: FacetFilterState): boolean {
  if (state.priceMax != null && Number.isFinite(state.priceMax) && row.price_num > state.priceMax) {
    return false;
  }
  if (state.productionDaysMax != null && Number.isFinite(state.productionDaysMax)) {
    if (row.production_days != null && row.production_days > state.productionDaysMax) return false;
  }
  if (state.minQtyMax != null && Number.isFinite(state.minQtyMax)) {
    if (row.min_qty_num != null && row.min_qty_num > state.minQtyMax) return false;
  }
  return true;
}

function listingMatchesMulti(row: ProductListingRow, multi: Partial<Record<string, string[]>>): boolean {
  if (!multi || Object.keys(multi).length === 0) return true;
  for (const [groupId, selected] of Object.entries(multi)) {
    if (!selected?.length) continue;
    const productVals = new Set(row.facet_multi[groupId] ?? []);
    const hit = selected.some((s) => productVals.has(s));
    if (!hit) return false;
  }
  return true;
}

export function applyFacetFiltersToListingRows(
  rows: ProductListingRow[],
  state: FacetFilterState | undefined
): ProductListingRow[] {
  if (!state || isEmptyFacetState(state)) return rows;
  return rows.filter(
    (r) => listingMatchesRanges(r, state) && listingMatchesMulti(r, state.multi ?? {})
  );
}

/** Facet counts using denormalized `facet_multi` + range columns (no full product graph). */
export function computeFacetCountMapFromListings(
  basePool: ProductListingRow[],
  state: FacetFilterState
): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const g of SEARCH_MULTI_FACET_GROUPS) {
    const multi = { ...state.multi };
    delete multi[g.id];
    const stateWithoutGroup: FacetFilterState = { ...state, multi };
    const pool = applyFacetFiltersToListingRows(
      basePool,
      isEmptyFacetState(stateWithoutGroup) ? undefined : stateWithoutGroup
    );
    const row: Record<string, number> = {};
    for (const opt of g.options) row[opt.value] = 0;
    for (const p of pool) {
      for (const v of p.facet_multi[g.id] ?? []) {
        if (row[v] !== undefined) row[v]++;
      }
    }
    out[g.id] = row;
  }
  return out;
}

export function facetCountMapForPool(
  basePool: VercelProduct[] | ProductListingRow[],
  state: FacetFilterState
): Record<string, Record<string, number>> {
  if (!basePool.length) {
    return computeFacetCountMap([], state);
  }
  if ('facet_multi' in basePool[0]!) {
    return computeFacetCountMapFromListings(basePool as ProductListingRow[], state);
  }
  return computeFacetCountMap(basePool as VercelProduct[], state);
}

