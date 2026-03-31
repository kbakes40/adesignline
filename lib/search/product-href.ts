/** PDP path from catalog handle (slug or absolute path). */
export function productPathFromHandle(handle: string): string {
  const h = handle.trim();
  if (!h) return '/search';
  if (h.startsWith('/')) return h;
  return `/product/${h}`;
}
