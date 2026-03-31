import {
  catalogCategoryFilters,
  countCatalogCategories,
  productsInCollectionPool
} from 'lib/collection-category-filters';
import Link from 'next/link';
import NikeCategorySidebar from './nike-category-sidebar';

function buildHref(
  collection: string,
  sort: string | undefined,
  category: string | undefined,
  q: string | undefined
) {
  const p = new URLSearchParams();
  if (q) p.set('q', q.replace(/\s+/g, '+'));
  if (sort) p.set('sort', sort);
  if (category) p.set('category', category);
  const qs = p.toString();
  return `/search/${collection}${qs ? `?${qs}` : ''}`;
}

export default function CollectionCategorySidebar({
  collection,
  sort,
  activeCategory,
  queryFilter
}: {
  collection:
    | 'nike'
    | 'carhartt'
    | 'brands'
    | 'categories'
    | 'men'
    | 'women'
    | 'gift-ideas'
    | 'promotional-products'
    | 'patches';
  sort?: string;
  activeCategory?: string;
  queryFilter?: string;
}) {
  if (collection === 'nike') {
    return <NikeCategorySidebar sort={sort} activeCategory={activeCategory} />;
  }

  const pool =
    collection === 'brands'
      ? productsInCollectionPool('brands', queryFilter)
      : productsInCollectionPool(collection, queryFilter);

  const total = pool.length;
  const counts = countCatalogCategories(pool);

  const linkClass = (active: boolean) =>
    [
      'block rounded-sm px-1.5 py-1 text-[12px] transition',
      active ? 'bg-neutral-200/80 font-medium text-black' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
    ].join(' ');

  return (
    <aside className="w-full shrink-0">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-600">Category</p>
      <nav className="rounded-lg border border-neutral-200 bg-[#f8f7f4] p-2.5 shadow-sm">
        <ul className="space-y-0.5">
          <li>
            <Link
              href={buildHref(collection, sort, undefined, queryFilter)}
              className={linkClass(!activeCategory)}
              scroll={false}
            >
              All products
              <span className="ml-1 text-neutral-400">({total})</span>
            </Link>
          </li>
          {catalogCategoryFilters.map(({ slug, label }) => (
            <li key={slug}>
              <Link
                href={buildHref(collection, sort, slug, queryFilter)}
                className={linkClass(activeCategory === slug)}
                scroll={false}
              >
                {label}
                <span className="ml-1 text-neutral-400">({counts[slug]})</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
