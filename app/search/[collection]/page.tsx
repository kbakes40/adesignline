import CollectionBrandSidebar from 'components/collection/collection-brand-sidebar';
import CollectionCategorySidebar from 'components/collection/collection-category-sidebar';
import CollectionQuickBrowseSidebar from 'components/collection/collection-quick-browse-sidebar';
import CollectionPagination from 'components/collection/collection-pagination';
import SearchFacetSidebar from 'components/search/search-facet-sidebar';
import ProductBrowseWithQuickView from 'components/collection/product-browse-with-quick-view';
import Grid from 'components/grid';
import { loadCollectionPage } from 'lib/catalog/catalog-gateway';
import { getCollection, getCollectionProducts } from 'lib/bigcommerce';
import { defaultSort, sorting } from 'lib/constants';
import { facetStateToFlatRecord, parseFacetFilterState } from 'lib/search-facet-engine';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { quickBrowseItemsForCollection } from 'lib/collection-quick-browse';

export async function generateMetadata({
  params
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: collectionSlug } = await params;
  const collection = await getCollection(collectionSlug);

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description || collection.description || `${collection.title} products`
  };
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { collection: collectionSlug } = await params;
  const sp = (await searchParams) ?? {};
  const { sort, category, q, page: pageParam } = sp as {
    sort?: string;
    category?: string;
    q?: string;
    page?: string;
  };
  const pageRaw = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const pageRequest = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
  const collection = await getCollection(collectionSlug);
  if (!collection) return notFound();

  const queryFilter = typeof q === 'string' ? q : undefined;
  const facetState = parseFacetFilterState(sp);
  const preserveQuery: Record<string, string> = {};
  if (typeof category === 'string' && category) preserveQuery.category = category;

  const bundle = await loadCollectionPage({
    collection: collectionSlug,
    sortKey,
    reverse,
    category,
    query: queryFilter,
    facetState,
    page: pageRequest,
    loadFullList: () =>
      getCollectionProducts({
        collection: collectionSlug,
        sortKey: 'RELEVANCE',
        reverse: false,
        category,
        query: queryFilter
      })
  });
  const products = bundle.source === 'supabase' ? bundle.cardProducts : bundle.products;
  const poolForCounts = bundle.source === 'supabase' ? bundle.facetBaseRows : bundle.facetBasePool;
  const total = bundle.total;
  const currentPage = bundle.page;
  const pageSize = bundle.pageSize;
  const totalPages = bundle.totalPages;
  const facetExtra = facetStateToFlatRecord(facetState);

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  const showBrandSidebar = ['nike', 'carhartt', 'brands'].includes(collectionSlug);

  const categorySidebarCollections = new Set([
    'nike',
    'carhartt',
    'brands',
    'categories',
    'men',
    'women',
    'gift-ideas',
    'promotional-products',
    'patches'
  ]);
  const showCategorySidebar = categorySidebarCollections.has(collectionSlug);

  const showQuickBrowseSidebar =
    quickBrowseItemsForCollection(collectionSlug).length > 0 && !showBrandSidebar;

  const showFacetSidebar = true;

  const hasSidebarColumn =
    showBrandSidebar || showCategorySidebar || showQuickBrowseSidebar || showFacetSidebar;

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-5">
      <div className="mb-8 flex flex-col gap-5 border-b border-neutral-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-black sm:text-base">Collection</p>
          <h1 className="mt-2 text-[2rem] font-medium tracking-[-0.04em] text-black sm:text-[2.25rem] md:text-[2.5rem]">
            {collection.title}
          </h1>
          {queryFilter ? (
            <p className="mt-3 text-[13px] text-neutral-600">
              Showing results for{' '}
              <span className="font-medium text-black">&ldquo;{queryFilter.replace(/\+/g, ' ')}&rdquo;</span>
            </p>
          ) : null}
          <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-neutral-500">{collection.description}</p>
        </div>
        <div className="shrink-0 text-right text-[12px] text-neutral-500">
          <p>{total} items</p>
          {total > 0 ? (
            <p className="mt-0.5 text-[11px] text-neutral-400">
              {rangeStart}–{rangeEnd} of {total}
            </p>
          ) : null}
        </div>
      </div>
      <div className={`flex flex-col gap-8 ${hasSidebarColumn ? 'lg:flex-row lg:items-start lg:gap-8' : ''}`}>
        {hasSidebarColumn ? (
          <div className="flex w-full shrink-0 flex-col gap-4 lg:-ml-10 lg:max-w-[min(100%,26rem)] lg:self-start xl:-ml-12">
            {showBrandSidebar ? (
              <CollectionBrandSidebar
                collection={collectionSlug}
                currentQuery={queryFilter}
                sort={sort}
              />
            ) : null}
            {showCategorySidebar ? (
              <CollectionCategorySidebar
                collection={
                  collectionSlug as
                    | 'nike'
                    | 'carhartt'
                    | 'brands'
                    | 'categories'
                    | 'men'
                    | 'women'
                    | 'gift-ideas'
                    | 'promotional-products'
                    | 'patches'
                }
                sort={sort}
                activeCategory={typeof category === 'string' ? category : undefined}
                queryFilter={queryFilter}
              />
            ) : null}
            {showQuickBrowseSidebar ? (
              <CollectionQuickBrowseSidebar
                collection={collectionSlug}
                sort={sort}
                activeQuery={queryFilter}
              />
            ) : null}
            {showFacetSidebar ? (
              <SearchFacetSidebar
                facetState={facetState}
                basePool={poolForCounts}
                sort={sort}
                q={queryFilter}
                searchPath={`/search/${collectionSlug}`}
                preserveQuery={preserveQuery}
              />
            ) : null}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <p className="py-3 text-[14px] text-neutral-500">No products found in this collection.</p>
          ) : (
            <Grid
              className={
                hasSidebarColumn
                  ? 'grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-9 xl:grid-cols-4 xl:gap-x-5 xl:gap-y-8'
                  : 'grid-cols-2 gap-x-5 gap-y-9 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-11 xl:grid-cols-4'
              }
            >
              <ProductBrowseWithQuickView
                products={products}
                catalogMode={bundle.source === 'supabase' ? 'supabase' : 'memory'}
              />
            </Grid>
          )}
          {products.length > 0 ? (
            <CollectionPagination
              basePath={`/search/${collectionSlug}`}
              currentPage={currentPage}
              totalPages={totalPages}
              sort={sort}
              category={typeof category === 'string' ? category : undefined}
              q={queryFilter}
              extraQuery={facetExtra}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
