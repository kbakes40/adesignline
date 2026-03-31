import type { VercelProduct } from './bigcommerce/types';

/** Brand rows for the collection sidebar (logos via Simple Icons CDN or explicit URLs) */
export type BrandExplorerDef = {
  id: string;
  label: string;
  /** Simple Icons slug — https://simpleicons.org — used when `iconUrl` is not set */
  iconSlug?: string;
  /** Full logo URL (e.g. Wikimedia Commons) when the brand is not in Simple Icons */
  iconUrl?: string;
  collection: 'nike' | 'carhartt' | 'brands';
  /** For `brands` collection only — multi-word queries as space-separated */
  query?: string;
};

export const brandExplorerDefs: BrandExplorerDef[] = [
  {
    id: 'all-brands',
    label: 'All brands',
    collection: 'brands',
    query: undefined
  },
  { id: 'nike', label: 'Nike', iconSlug: 'nike', collection: 'nike' },
  {
    id: 'carhartt',
    label: 'Carhartt',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Carhartt_logo.svg',
    collection: 'carhartt'
  },
  {
    id: 'columbia',
    label: 'Columbia',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Columbia_Sportswear_Co_logo.svg',
    collection: 'brands',
    query: 'columbia'
  },
  {
    id: 'cutter-buck',
    label: 'Cutter & Buck',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/en/3/38/Cutter_and_Buck_Logo.PNG',
    collection: 'brands',
    query: 'cutter buck'
  },
  {
    id: 'fruit-loom',
    label: 'Fruit of the Loom',
    iconUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/FOL_Trademark_Label.jpg/256px-FOL_Trademark_Label.jpg',
    collection: 'brands',
    query: 'fruit of the loom'
  },
  {
    id: 'moleskine',
    label: 'Moleskine',
    iconUrl: '/brand-icons/moleskine.svg',
    collection: 'brands',
    query: 'moleskine'
  },
  { id: 'puma', label: 'Puma', iconSlug: 'puma', collection: 'brands', query: 'puma' },
  { id: 'north-face', label: 'The North Face', iconSlug: 'thenorthface', collection: 'brands', query: 'north face' },
  { id: 'under-armour', label: 'Under Armour', iconSlug: 'underarmour', collection: 'brands', query: 'under armour' }
];

export function brandExplorerHref(def: BrandExplorerDef, sort?: string): string {
  const base = `/search/${def.collection}`;
  const p = new URLSearchParams();
  if (def.query) p.set('q', def.query.replace(/\s+/g, '+'));
  if (sort) p.set('sort', sort);
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

function haystack(p: VercelProduct): string {
  return [p.title, p.description, ...p.tags].join(' ').toLowerCase();
}

export function countProductsForBrandDef(def: BrandExplorerDef, all: VercelProduct[]): number {
  if (def.id === 'all-brands') {
    return all.filter((p) => p.tags.includes('brands')).length;
  }
  if (def.collection === 'nike') {
    return all.filter((p) => p.tags.includes('nike')).length;
  }
  if (def.collection === 'carhartt') {
    return all.filter((p) => p.tags.includes('carhartt')).length;
  }
  if (def.collection === 'brands') {
    const inBrands = all.filter((p) => p.tags.includes('brands'));
    if (!def.query) return inBrands.length;
    const tokens = def.query.toLowerCase().split(/\s+/).filter(Boolean);
    return inBrands.filter((p) => {
      const h = haystack(p);
      return tokens.every((t) => h.includes(t));
    }).length;
  }
  return 0;
}

export function isBrandDefActive(
  def: BrandExplorerDef,
  currentCollection: string,
  currentQuery?: string
): boolean {
  const qNorm = (currentQuery ?? '').trim().toLowerCase().replace(/\+/g, ' ');
  if (def.id === 'all-brands') {
    return currentCollection === 'brands' && !qNorm;
  }
  if (def.collection !== currentCollection) return false;
  const defQ = (def.query ?? '').trim().toLowerCase();
  if (!def.query) return !qNorm;
  return qNorm === defQ;
}

export type BrandSidebarRow = BrandExplorerDef & {
  href: string;
  count: number;
  active: boolean;
};

export function buildBrandSidebarRows(
  allProducts: VercelProduct[],
  currentCollection: string,
  currentQuery: string | undefined,
  sort: string | undefined
): BrandSidebarRow[] {
  return brandExplorerDefs.map((def) => ({
    ...def,
    href: brandExplorerHref(def, sort),
    count: countProductsForBrandDef(def, allProducts),
    active: isBrandDefActive(def, currentCollection, currentQuery)
  }));
}
