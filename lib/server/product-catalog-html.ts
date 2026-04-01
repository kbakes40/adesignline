import { readFile } from 'fs/promises';
import path from 'path';
import type { VercelProduct } from 'lib/bigcommerce/types';

export type ProductCatalogHtmlFile = {
  productOptionsHtml?: string;
  salesToolsHtml?: string;
  inventoryHtml?: string;
};

export async function readProductCatalogHtmlFile(productId: string): Promise<ProductCatalogHtmlFile | null> {
  const file = path.join(process.cwd(), 'public', 'data', 'product-html', `${productId}.json`);
  try {
    const raw = await readFile(file, 'utf8');
    return JSON.parse(raw) as ProductCatalogHtmlFile;
  } catch {
    return null;
  }
}

/** Fill missing `catalog` HTML from static JSON (generated under public/data/product-html). */
export function mergeCatalogHtmlFromFile(
  product: VercelProduct,
  file: ProductCatalogHtmlFile | null
): VercelProduct {
  if (!file) return product;
  const c = product.catalog ?? {};
  const next = {
    ...c,
    productOptionsHtml: c.productOptionsHtml ?? file.productOptionsHtml,
    salesToolsHtml: c.salesToolsHtml ?? file.salesToolsHtml,
    inventoryHtml: c.inventoryHtml ?? file.inventoryHtml
  };
  const unchanged =
    next.productOptionsHtml === c.productOptionsHtml &&
    next.salesToolsHtml === c.salesToolsHtml &&
    next.inventoryHtml === c.inventoryHtml;
  if (unchanged) return product;
  return { ...product, catalog: next };
}

export async function withCatalogHtmlFromPublicFiles(product: VercelProduct): Promise<VercelProduct> {
  const file = await readProductCatalogHtmlFile(product.id);
  return mergeCatalogHtmlFromFile(product, file);
}
