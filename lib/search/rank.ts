import type { ProductListingRow } from 'lib/catalog/product-listing-types';
import type { VercelProduct } from 'lib/bigcommerce/types';
import {
  compactKey,
  expandQueryAliases,
  hyphenFold,
  normalizeQuery,
  singularLoose,
  tokenize
} from './normalize';

function listingHaystack(row: ProductListingRow): string {
  return [
    row.title,
    row.sku ?? '',
    row.brand ?? '',
    row.category ?? '',
    row.subcategory ?? '',
    row.merch_category ?? '',
    row.short_description ?? '',
    row.search_text ?? '',
    ...row.tags
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Higher = better. Used for relevance sort and autocomplete ordering.
 * Tiers (approx): exact title > SKU > brand > category > title contains > keyword blob.
 */
export function scoreListingRelevance(row: ProductListingRow, rawQuery: string): number {
  const expanded = expandQueryAliases(rawQuery);
  const q = normalizeQuery(expanded);
  if (!q) return 0;

  const qTokens = tokenize(q);
  const qCompact = compactKey(q);
  const qFold = hyphenFold(q);

  const title = row.title.toLowerCase();
  const titleFold = hyphenFold(row.title);
  const sku = (row.sku ?? '').toLowerCase().replace(/\s+/g, '');
  const brand = (row.brand ?? '').toLowerCase();
  const cat = `${row.category ?? ''} ${row.subcategory ?? ''} ${row.merch_category ?? ''}`.toLowerCase();
  const hay = listingHaystack(row);
  const hayFold = hyphenFold(hay);
  const hayCompact = compactKey(hay);

  let score = 0;

  if (title === q) score += 10_000_000;
  else if (titleFold === qFold || compactKey(title) === qCompact) score += 9_800_000;

  if (sku && (sku === compactKey(q) || sku === q.replace(/\s/g, '') || sku.includes(qCompact))) {
    score += 9_000_000;
  }

  if (brand && (brand === q || qTokens.some((t) => brand === t || brand.includes(t)))) {
    score += 7_000_000;
  }

  if (cat.includes(q) || qTokens.some((t) => cat.includes(t))) {
    score += 5_000_000;
  }

  if (title.startsWith(q)) score += 4_500_000;
  else if (title.includes(q)) score += 3_000_000;
  else if (qCompact.length >= 3 && compactKey(title).includes(qCompact)) score += 2_800_000;
  else if (qFold.length >= 3 && titleFold.includes(qFold)) score += 2_600_000;

  if (hay.includes(q)) score += 1_500_000;
  else if (qCompact.length >= 3 && hayCompact.includes(qCompact)) score += 1_200_000;
  else if (qFold.length >= 3 && hayFold.includes(qFold)) score += 1_000_000;

  for (const t of qTokens) {
    if (hay.includes(t)) score += 50_000;
    const sg = singularLoose(t);
    if (sg !== t && hay.includes(sg)) score += 40_000;
  }

  return score;
}

export function scoreVercelProduct(product: VercelProduct, rawQuery: string): number {
  const expanded = expandQueryAliases(rawQuery);
  const q = normalizeQuery(expanded);
  if (!q) return 0;

  const qCompact = compactKey(q);
  const qFold = hyphenFold(q);
  const title = product.title.toLowerCase();
  const titleFold = hyphenFold(product.title);
  const sku = (product.catalog?.supplierSku ?? '').toLowerCase().replace(/\s+/g, '');
  const hay = [product.title, product.description, ...product.tags].join(' ').toLowerCase();
  const hayFold = hyphenFold(hay);
  const hayCompact = compactKey(hay);

  let score = 0;
  if (title === q) score += 10_000_000;
  if (sku && (sku === qCompact || hay.includes(q))) score += 9_000_000;
  if (title.startsWith(q)) score += 4_500_000;
  else if (title.includes(q)) score += 3_000_000;
  else if (qCompact.length >= 3 && compactKey(title).includes(qCompact)) score += 2_800_000;
  else if (qFold.length >= 3 && titleFold.includes(qFold)) score += 2_600_000;
  if (hay.includes(q)) score += 1_500_000;
  else if (qCompact.length >= 3 && hayCompact.includes(qCompact)) score += 1_200_000;
  else if (qFold.length >= 3 && hayFold.includes(qFold)) score += 1_000_000;

  for (const t of tokenize(q)) {
    if (hay.includes(t)) score += 50_000;
  }
  return score;
}

export function listingMatchesQuery(row: ProductListingRow, rawQuery: string): boolean {
  const q = normalizeQuery(expandQueryAliases(rawQuery));
  if (!q) return true;
  if (scoreListingRelevance(row, rawQuery) > 0) return true;

  const hay = hyphenFold(listingHaystack(row));
  const tokens = tokenize(q);
  return tokens.every((t) => {
    const tf = hyphenFold(t);
    const sg = singularLoose(t);
    return hay.includes(tf) || hay.includes(hyphenFold(sg));
  });
}

export function productMatchesQuery(product: VercelProduct, rawQuery: string): boolean {
  const q = normalizeQuery(expandQueryAliases(rawQuery));
  if (!q) return true;
  if (scoreVercelProduct(product, rawQuery) > 0) return true;

  const hay = hyphenFold([product.title, product.description, ...product.tags].join(' '));
  const tokens = tokenize(q);
  return tokens.every((t) => hay.includes(hyphenFold(t)) || hay.includes(hyphenFold(singularLoose(t))));
}

export function sortListingsByRelevance(rows: ProductListingRow[], rawQuery: string | undefined): ProductListingRow[] {
  const q = rawQuery?.trim();
  if (!q) return [...rows].sort((a, b) => a.title.localeCompare(b.title));
  return [...rows].sort((a, b) => scoreListingRelevance(b, q) - scoreListingRelevance(a, q));
}

export function sortProductsByRelevance(products: VercelProduct[], rawQuery: string | undefined): VercelProduct[] {
  const q = rawQuery?.trim();
  if (!q) return [...products].sort((a, b) => a.title.localeCompare(b.title));
  return [...products].sort((a, b) => scoreVercelProduct(b, q) - scoreVercelProduct(a, q));
}
