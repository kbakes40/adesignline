import type { VercelProduct } from './bigcommerce/types';

/** Patch catalog products carry this tag (see product-description qualifier). */
export function isPatchProduct(product: VercelProduct): boolean {
  return product.tags.includes('patches');
}
