import type { VercelProduct } from './bigcommerce/types';
import { products } from './adesignline-data';

function haystack(p: VercelProduct): string {
  return [p.title, p.description, ...p.tags].join(' ').toLowerCase();
}

/** Four buckets (labels mirror Nike’s sidebar style; slugs are distinct from Nike `nike-cat-*` params). */
export const catalogCategoryFilters = [
  { slug: 'merch-apparel', label: 'Apparel, Caps, and Hats' },
  { slug: 'merch-outerwear', label: 'Outerwear & Fleece' },
  { slug: 'merch-bottoms', label: 'Bottoms & Coveralls' },
  { slug: 'merch-accessories', label: 'Bags, Totes, and Accessories' }
] as const;

export type CatalogCategorySlug = (typeof catalogCategoryFilters)[number]['slug'];

/** First matching rule wins (outerwear-style titles before generic “shirt”). */
export function categorySlugForProduct(p: VercelProduct): CatalogCategorySlug | undefined {
  const h = haystack(p);

  if (
    /\b(jacket|jac\.|jac\b|coat|parka|shell|vest|hoodie|hooded|sweatshirt|fleece|pullover|zip|mid-layer|midlayer|anorak|windbreaker|rain)\b/i.test(
      h
    ) ||
    h.includes('1/2-zip') ||
    h.includes('half-zip') ||
    h.includes('full-zip')
  ) {
    return 'merch-outerwear';
  }

  if (
    /\b(pant|pants|short|shorts|bib|overall|coverall|jean|cargo|trouser)\b/i.test(h) ||
    h.includes('dungaree')
  ) {
    return 'merch-bottoms';
  }

  if (
    /\b(bag|backpack|tote|duffel|duffle|cooler|lunch|cap|beanie|hat|visor|apron|sock|socks|glove|mitt|belt)\b/i.test(
      h
    )
  ) {
    return 'merch-accessories';
  }

  if (
    /\b(polo|shirt|tee|t-shirt|henley|mock|tank|top|scrub|uniform)\b/i.test(h) ||
    h.includes('long sleeve') ||
    h.includes('long-sleeve')
  ) {
    return 'merch-apparel';
  }

  return undefined;
}

export function productMatchesCatalogCategory(p: VercelProduct, slug: CatalogCategorySlug): boolean {
  return categorySlugForProduct(p) === slug;
}

export function countCatalogCategories(
  pool: VercelProduct[]
): Record<CatalogCategorySlug, number> {
  const initial = {} as Record<CatalogCategorySlug, number>;
  for (const { slug } of catalogCategoryFilters) {
    initial[slug] = 0;
  }
  for (const p of pool) {
    const s = categorySlugForProduct(p);
    if (s) initial[s]++;
  }
  return initial;
}

export const catalogCategorySlugs = new Set<string>(catalogCategoryFilters.map((c) => c.slug));

/** Collections where `?category=merch-*` filters by inferred product type (same buckets as Carhartt / Brands). */
export const collectionsWithCatalogCategoryParam = new Set<string>([
  'carhartt',
  'brands',
  'categories',
  'men',
  'women',
  'gift-ideas',
  'promotional-products',
  'patches'
]);

/** Product pool for a collection tag, optionally narrowed by the same `q` rules as `getCollectionProducts`. */
export function productsInCollectionPool(collection: string, queryFilter?: string): VercelProduct[] {
  let filtered = products.filter((p) => p.tags.includes(collection));
  if (queryFilter?.trim()) {
    const raw = queryFilter.trim().toLowerCase().replace(/\+/g, ' ');
    const tokens = raw.split(/\s+/).filter(Boolean);
    filtered = filtered.filter((p) => {
      const hay = [p.title, p.description, ...p.tags].join(' ').toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }
  return filtered;
}
