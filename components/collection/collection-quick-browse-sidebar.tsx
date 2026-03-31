import { quickBrowseItemsForCollection } from 'lib/collection-quick-browse';
import Link from 'next/link';

function buildHref(
  collection: string,
  sort: string | undefined,
  category: string | undefined,
  q: string
) {
  const p = new URLSearchParams();
  if (q.trim()) p.set('q', q.trim().replace(/\s+/g, '+'));
  if (sort) p.set('sort', sort);
  if (category) p.set('category', category);
  const qs = p.toString();
  return `/search/${collection}${qs ? `?${qs}` : ''}`;
}

export default function CollectionQuickBrowseSidebar({
  collection,
  sort,
  activeQuery
}: {
  collection: string;
  sort?: string;
  activeQuery?: string;
}) {
  const items = quickBrowseItemsForCollection(collection);
  if (items.length === 0) return null;

  const normalizedActive = activeQuery?.trim().toLowerCase().replace(/\+/g, ' ');

  const linkClass = (active: boolean) =>
    [
      'block rounded-sm px-1.5 py-1 text-[12px] transition',
      active ? 'bg-neutral-200/80 font-medium text-black' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
    ].join(' ');

  return (
    <aside className="w-full shrink-0">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-600">Shop by type</p>
      <nav className="rounded-lg border border-neutral-200 bg-white p-2.5 shadow-sm">
        <ul className="space-y-0.5">
          <li>
            <Link
              href={buildHref(collection, sort, undefined, '')}
              className={linkClass(!normalizedActive)}
              scroll={false}
            >
              All in this collection
            </Link>
          </li>
          {items.map(({ label, q }) => {
            const isActive = normalizedActive === q.trim().toLowerCase();
            return (
              <li key={`${label}-${q}`}>
                <Link
                  href={buildHref(collection, sort, undefined, q)}
                  className={linkClass(isActive)}
                  scroll={false}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
