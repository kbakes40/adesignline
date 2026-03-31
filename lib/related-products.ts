import type { VercelProduct } from './bigcommerce/types';
import { products } from './adesignline-data';

/** Tags that don’t distinguish “same program” for recommendations */
const GENERIC_TAGS = new Set([
  'brands',
  'categories',
  'men',
  'women',
  'promotional-products',
  'gift-ideas',
  'hidden-homepage-featured-items',
  'hidden-homepage-carousel'
]);

function sharedTagScore(current: VercelProduct, other: VercelProduct): number {
  const otherSet = new Set(other.tags);
  let score = 0;
  for (const t of current.tags) {
    if (!otherSet.has(t)) continue;
    if (t.startsWith('hidden-')) continue;
    if (GENERIC_TAGS.has(t)) {
      score += 2;
    } else if (t.startsWith('nike-cat-')) {
      score += 28;
    } else {
      score += 22;
    }
  }
  return score;
}

const TITLE_STOP = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'this',
  'that',
  'nike',
  'carhartt',
  'columbia',
  'puma',
  'moleskine',
  'mens',
  'womens',
  'women',
  'men'
]);

/** Small boost when titles share distinctive words (style names, materials, etc.). */
function titleWordOverlap(a: VercelProduct, b: VercelProduct): number {
  const words = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 4 && !TITLE_STOP.has(w))
    );
  const wa = words(a.title);
  let n = 0;
  for (const w of b.title.toLowerCase().split(/\W+/)) {
    if (w.length > 4 && !TITLE_STOP.has(w) && wa.has(w)) n++;
  }
  return Math.min(n, 4);
}

/**
 * Related SKUs: prefer same brand / Nike category, then shared catalog tags, then title similarity.
 * Falls back to most recently updated items when scores tie or are low.
 */
export function getRelatedProductsForProduct(current: VercelProduct, limit = 4): VercelProduct[] {
  const pool = products.filter((p) => p.id !== current.id);
  const scored = pool.map((p) => ({
    p,
    score: sharedTagScore(current, p) + titleWordOverlap(current, p)
  }));
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.p.updatedAt).getTime() - new Date(a.p.updatedAt).getTime();
  });
  return scored.slice(0, limit).map((x) => x.p);
}
