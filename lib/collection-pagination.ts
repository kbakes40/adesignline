/** Default page size for collection and shop product grids */
export const COLLECTION_PAGE_SIZE = 24;

export function paginateProducts<T>(items: T[], page: number, pageSize = COLLECTION_PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (p - 1) * pageSize;
  return {
    page: p,
    pageSize,
    total,
    totalPages,
    items: items.slice(start, start + pageSize)
  };
}
