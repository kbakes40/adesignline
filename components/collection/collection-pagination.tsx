import Link from 'next/link';

function buildHref(
  basePath: string,
  page: number,
  preserved: { sort?: string; category?: string; q?: string },
  extraQuery?: Record<string, string>
) {
  const params = new URLSearchParams();
  if (preserved.sort) params.set('sort', preserved.sort);
  if (preserved.category) params.set('category', preserved.category);
  if (preserved.q) params.set('q', preserved.q.replace(/\s+/g, '+'));
  if (extraQuery) {
    for (const [k, v] of Object.entries(extraQuery)) {
      if (v) params.set(k, v);
    }
  }
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function CollectionPagination({
  basePath,
  currentPage,
  totalPages,
  sort,
  category,
  q,
  extraQuery
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  sort?: string;
  category?: string;
  q?: string;
  /** e.g. `/search` facet params (`pmax`, `f_brand`, …) */
  extraQuery?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const preserved = { sort, category, q };
  const prev = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < totalPages ? currentPage + 1 : null;

  const windowSize = 5;
  let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }
  const pageNumbers: number[] = [];
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-neutral-200/80 pt-8"
      aria-label="Product list pagination"
    >
      {prev ? (
        <Link
          href={buildHref(basePath, prev, preserved, extraQuery)}
          scroll={false}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-[12px] font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-black"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-full border border-transparent px-3 py-1.5 text-[12px] text-neutral-300">
          Previous
        </span>
      )}

      <ul className="flex flex-wrap items-center gap-1">
        {pageNumbers.map((n) => (
          <li key={n}>
            {n === currentPage ? (
              <span
                className="flex min-w-[2.25rem] items-center justify-center rounded-full bg-black px-2 py-1.5 text-[12px] font-medium text-white"
                aria-current="page"
              >
                {n}
              </span>
            ) : (
              <Link
                href={buildHref(basePath, n, preserved, extraQuery)}
                scroll={false}
                className="flex min-w-[2.25rem] items-center justify-center rounded-full border border-transparent px-2 py-1.5 text-[12px] text-neutral-600 transition hover:border-neutral-200 hover:text-black"
              >
                {n}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {next ? (
        <Link
          href={buildHref(basePath, next, preserved, extraQuery)}
          scroll={false}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-[12px] font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-black"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-full border border-transparent px-3 py-1.5 text-[12px] text-neutral-300">
          Next
        </span>
      )}
    </nav>
  );
}
