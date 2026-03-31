import { products } from 'lib/adesignline-data';
import { countNikeProductsByCategory, nikeCategoryFilters } from 'lib/nike-catalog-data';
import Link from 'next/link';

function searchParamsToHref(sort: string | undefined, category: string | undefined) {
  const p = new URLSearchParams();
  if (sort) p.set('sort', sort);
  if (category) p.set('category', category);
  const q = p.toString();
  return `/search/nike${q ? `?${q}` : ''}`;
}

export default function NikeCategorySidebar({
  sort,
  activeCategory
}: {
  sort?: string;
  activeCategory?: string;
}) {
  const nikeTotal = products.filter((p) => p.tags.includes('nike')).length;
  const counts = countNikeProductsByCategory(products);

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
            <Link href={searchParamsToHref(sort, undefined)} className={linkClass(!activeCategory)} scroll={false}>
              All products
              <span className="ml-1 text-neutral-400">({nikeTotal})</span>
            </Link>
          </li>
          {nikeCategoryFilters.map(({ slug, label }) => (
            <li key={slug}>
              <Link
                href={searchParamsToHref(sort, slug)}
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
