import CollectionPagination from 'components/collection/collection-pagination';
import ProductBrowseWithQuickView from 'components/collection/product-browse-with-quick-view';
import Grid from 'components/grid';
import SearchFacetSidebar from 'components/search/search-facet-sidebar';
import { getProducts } from 'lib/bigcommerce';
import { loadSearchPage } from 'lib/catalog/catalog-gateway';
import { defaultSort, sorting } from 'lib/constants';
import { facetStateToFlatRecord, parseFacetFilterState } from 'lib/search-facet-engine';
import Link from 'next/link';

export const metadata = {
  title: 'Shop',
  description: 'Browse premium branded merchandise, apparel, gifts, and custom programs from A Design Line.'
};

export default async function SearchPage({
  searchParams
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = (await searchParams) ?? {};
  const { sort, q: searchValue, page: pageParam } = sp as {
    sort?: string;
    q?: string;
    page?: string;
  };
  const pageRaw = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const pageRequest = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;

  const facetState = parseFacetFilterState(sp);
  const bundle = await loadSearchPage({
    query: searchValue,
    sortKey,
    reverse,
    facetState,
    page: pageRequest,
    loadFullList: () => getProducts({ query: searchValue })
  });

  const products = bundle.source === 'supabase' ? bundle.cardProducts : bundle.products;
  const poolForCounts = bundle.source === 'supabase' ? bundle.facetBaseRows : bundle.facetBasePool;
  const total = bundle.total;
  const currentPage = bundle.page;
  const pageSize = bundle.pageSize;
  const totalPages = bundle.totalPages;

  const resultsText = total === 1 ? 'product' : 'products';
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);
  const facetExtra = facetStateToFlatRecord(facetState);

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-5">
      <div className="mb-8 flex flex-col gap-5 border-b border-neutral-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          {searchValue ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Search</p>
              <h1 className="mt-1 text-xl font-medium tracking-tight text-black sm:text-2xl">
                Results for &ldquo;{searchValue}&rdquo;
              </h1>
            </>
          ) : (
            <p className="text-sm font-medium text-black sm:text-base">All Products</p>
          )}
          <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
            Browse apparel, gift ideas, promotional products, and custom-ready merchandise. Use filters to narrow by
            price, lead time, brand, color, decoration, and more.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4 text-[12px] text-neutral-500">
          <span className="text-right">
            {total} {resultsText}
            {total > 0 ? (
              <span className="mt-0.5 block text-[11px] text-neutral-400">
                {rangeStart}–{rangeEnd} of {total}
              </span>
            ) : null}
          </span>
          <Link
            href="/pages/custom-orders"
            className="rounded-full border border-neutral-200 px-3 py-1.5 text-black transition hover:bg-black hover:text-white"
          >
            Custom Order
          </Link>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-10">
        <aside className="border-neutral-200 pr-0 lg:border-r lg:pr-6">
          <SearchFacetSidebar facetState={facetState} basePool={poolForCounts} sort={sort} q={searchValue} />
        </aside>
        <div className="min-w-0">
          {searchValue ? (
            <p className="mb-6 text-[12px] text-neutral-500">
              Refined by query <span className="font-medium text-neutral-700">&ldquo;{searchValue}&rdquo;</span> — use
              filters to narrow further.
            </p>
          ) : null}
          <Grid className="grid-cols-2 gap-x-5 gap-y-9 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-7 xl:grid-cols-5 xl:gap-x-6">
            <ProductBrowseWithQuickView
              products={products}
              catalogMode={bundle.source === 'supabase' ? 'supabase' : 'memory'}
            />
          </Grid>
          {products.length > 0 ? (
            <CollectionPagination
              basePath="/search"
              currentPage={currentPage}
              totalPages={totalPages}
              sort={sort}
              q={searchValue}
              extraQuery={facetExtra}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
