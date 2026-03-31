import type { ProductListingRow } from 'lib/catalog/product-listing-types';
import { facetCountMapForPool } from 'lib/catalog/listing-facet';
import type { VercelProduct } from 'lib/bigcommerce/types';
import { SEARCH_MULTI_FACET_GROUPS, SEARCH_RANGE_LABELS } from 'lib/search-facet-data';
import {
  clearFacetsHref,
  facetToggleHref,
  isEmptyFacetState,
  type FacetFilterState
} from 'lib/search-facet-engine';
import Link from 'next/link';

export default function SearchFacetSidebar({
  facetState,
  basePool,
  sort,
  q,
  searchPath = '/search',
  preserveQuery
}: {
  facetState: FacetFilterState;
  /** Pre-facet pool (same semantics as before): search/collection match, no facet filters. */
  basePool: VercelProduct[] | ProductListingRow[];
  sort?: string;
  q?: string;
  /** Defaults to `/search`; use `/search/categories` (etc.) on collection routes. */
  searchPath?: string;
  /** Preserve native collection params (e.g. `category` = merch bucket for Nike/Carhartt). */
  preserveQuery?: Record<string, string>;
}) {
  const base = { sort, q };
  const preserve = preserveQuery;
  const counts = facetCountMapForPool(basePool, facetState);
  const hasFilters = !isEmptyFacetState(facetState);

  return (
    <div className="space-y-5 text-[12px] text-neutral-700">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-600">Refine results</p>
        {hasFilters ? (
          <Link
            href={`${searchPath}${clearFacetsHref(base, preserve)}`}
            className="text-[11px] font-medium text-neutral-500 underline-offset-2 hover:text-black hover:underline"
            scroll={false}
          >
            Clear all
          </Link>
        ) : null}
      </div>

      <FacetRangeForm
        facetState={facetState}
        sort={sort}
        q={q}
        action={searchPath}
        preserveQuery={preserveQuery}
      />

      <div className="space-y-3 pr-1">
        {SEARCH_MULTI_FACET_GROUPS.map((group) => {
          const groupCounts = counts[group.id] ?? {};
          return (
            <details key={group.id} className="group rounded-lg border border-neutral-200 bg-[#fafaf8] open:bg-white">
              <summary className="cursor-pointer list-none px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-600 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  {group.label}
                  <span className="text-neutral-400 transition group-open:rotate-180">▼</span>
                </span>
              </summary>
              <ul className="space-y-0.5 border-t border-neutral-100 px-2 py-2">
                {group.options.map((opt) => {
                  const active = facetState.multi[group.id]?.includes(opt.value) ?? false;
                  const c = groupCounts[opt.value] ?? 0;
                  const href = `${searchPath}${facetToggleHref(facetState, group.id, opt.value, base, preserve)}`;
                  return (
                    <li key={opt.value}>
                      <Link
                        href={href}
                        scroll={false}
                        className={[
                          'flex items-center justify-between gap-2 rounded px-1.5 py-1 transition',
                          active ? 'bg-neutral-200/80 font-medium text-black' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                        ].join(' ')}
                      >
                        <span>{opt.label}</span>
                        <span className="shrink-0 text-[11px] text-neutral-400">({c})</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function FacetRangeForm({
  facetState,
  sort,
  q,
  action,
  preserveQuery
}: {
  facetState: FacetFilterState;
  sort?: string;
  q?: string;
  action: string;
  preserveQuery?: Record<string, string>;
}) {
  return (
    <form action={action} method="get" className="space-y-2 rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm">
      {sort ? <input type="hidden" name="sort" value={sort} /> : null}
      {q ? <input type="hidden" name="q" value={q} /> : null}
      {preserveQuery
        ? Object.entries(preserveQuery).map(([k, v]) =>
            v ? <input key={k} type="hidden" name={k} value={v} /> : null
          )
        : null}
      {Object.entries(facetState.multi).map(([k, vals]) =>
        vals?.length ? <input key={k} type="hidden" name={`f_${k}`} value={vals.join(',')} /> : null
      )}
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-600">Ranges</p>
      <label className="flex flex-col gap-0.5">
        <span className="text-[11px] text-neutral-500">{SEARCH_RANGE_LABELS.price_max}</span>
        <input
          name="pmax"
          type="number"
          min={0}
          step={1}
          placeholder="e.g. 250"
          defaultValue={facetState.priceMax ?? ''}
          className="rounded border border-neutral-200 px-2 py-1 text-[12px] text-black"
        />
      </label>
      <label className="flex flex-col gap-0.5">
        <span className="text-[11px] text-neutral-500">{SEARCH_RANGE_LABELS.production_days_max}</span>
        <input
          name="dmax"
          type="number"
          min={0}
          step={1}
          placeholder="e.g. 14"
          defaultValue={facetState.productionDaysMax ?? ''}
          className="rounded border border-neutral-200 px-2 py-1 text-[12px] text-black"
        />
      </label>
      <label className="flex flex-col gap-0.5">
        <span className="text-[11px] text-neutral-500">{SEARCH_RANGE_LABELS.min_qty_max}</span>
        <input
          name="mqmax"
          type="number"
          min={0}
          step={1}
          placeholder="e.g. 24"
          defaultValue={facetState.minQtyMax ?? ''}
          className="rounded border border-neutral-200 px-2 py-1 text-[12px] text-black"
        />
      </label>
      <button
        type="submit"
        className="mt-1 w-full rounded-md bg-black px-2 py-1.5 text-[11px] font-medium text-white transition hover:bg-neutral-800"
      >
        Apply ranges
      </button>
    </form>
  );
}
