import type { VercelProduct as Product } from 'lib/bigcommerce/types';
import { supplierSkuFromTitle } from 'lib/nike-catalog-data';

export function skuForProduct(product: Product): string | undefined {
  return product.catalog?.supplierSku ?? supplierSkuFromTitle(product.title);
}
