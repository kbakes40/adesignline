/** Maps nav brand labels (`navigationGroups.Brands`) to `/public/brand-icons/*.svg`. Omit entries when no asset exists. */
export const brandNavLogoSrc: Partial<Record<string, string>> = {
  Carhartt: '/brand-icons/carhartt.svg',
  Columbia: '/brand-icons/columbia.svg',
  'Cutter & Buck': '/brand-icons/cutter-buck.svg',
  Moleskine: '/brand-icons/moleskine.svg',
  Nike: '/brand-icons/nike.svg',
  Puma: '/brand-icons/puma.svg',
  'The North Face': '/brand-icons/thenorthface.svg',
  'Under Armour': '/brand-icons/underarmour.svg'
};
