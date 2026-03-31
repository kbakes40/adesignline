/** Curated conversion-friendly terms for empty / cold-start suggestions. */
export const POPULAR_SEARCH_QUERIES = [
  { label: 'Backpacks', q: 'backpack' },
  { label: 'Duffel bags', q: 'duffel' },
  { label: 'Custom hats', q: 'hat' },
  { label: 'Nike polos', q: 'nike polo' },
  { label: 'Drinkware', q: 'drinkware' },
  { label: 'Patches', q: 'patches' },
  { label: 'Safety gear', q: 'safety' },
  { label: 'Outerwear', q: 'outerwear' },
  { label: 'T-shirts', q: 't-shirt' },
  { label: 'Gift ideas', q: 'gift' }
] as const;

export const FEATURED_BRAND_SUGGESTIONS = [
  { label: 'Nike', href: '/search/nike' },
  { label: 'Carhartt', href: '/search/carhartt' },
  { label: 'The North Face', href: '/search/brands?q=north+face' },
  { label: 'Under Armour', href: '/search/brands?q=under+armour' }
] as const;

export const FEATURED_CATEGORY_SUGGESTIONS = [
  { label: 'Polos', href: '/search/categories?q=polo' },
  { label: 'Headwear', href: '/search/categories?q=headwear' },
  { label: 'Bags', href: '/search/categories?q=bags' },
  { label: 'Activewear', href: '/search/categories?q=activewear' }
] as const;
