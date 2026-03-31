import type { VercelProduct } from './bigcommerce/types';

/** Last path segment of handle — stable for `?product=` deep links */
export function productSlugForUrl(product: VercelProduct): string {
  const raw = product.handle.replace(/^\//, '');
  const parts = raw.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? product.id;
}

export function findProductByUrlParam(products: VercelProduct[], param: string): VercelProduct | undefined {
  const decoded = decodeURIComponent(param).trim();
  if (!decoded) return undefined;
  return products.find(
    (p) => p.id === decoded || productSlugForUrl(p) === decoded || p.handle.replace(/^\//, '') === decoded
  );
}
