import { VercelSortKeys } from 'lib/constants';
import type { VercelProduct } from 'lib/bigcommerce/types';

export function sortProducts(
  items: VercelProduct[],
  sortKey: keyof typeof VercelSortKeys = 'RELEVANCE',
  reverse = false
): VercelProduct[] {
  return [...items].sort((a, b) => {
    switch (sortKey) {
      case 'CREATED_AT': {
        const cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        return reverse ? -cmp : cmp;
      }
      case 'PRICE': {
        const pa = Number.parseFloat(a.priceRange.minVariantPrice.amount);
        const pb = Number.parseFloat(b.priceRange.minVariantPrice.amount);
        const cmp = pa - pb;
        return reverse ? -cmp : cmp;
      }
      case 'BEST_SELLING':
      case 'RELEVANCE':
      default:
        return 0;
    }
  });
}
