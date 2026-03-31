import type { VercelProduct } from './bigcommerce/types';

/**
 * Quick view shows the artwork / customization column when this is true.
 * Explicit `supportsCustomization: false` opts out; otherwise catalog items with a
 * `supplierSku` (Nike, Carhartt, brand imports, etc.) default to customizable.
 */
export function productSupportsCustomization(product: VercelProduct): boolean {
  const c = product.catalog;
  if (!c) return false;
  if (c.supportsCustomization === false) return false;
  if (c.supportsCustomization === true) return true;
  return Boolean(c.supplierSku);
}
