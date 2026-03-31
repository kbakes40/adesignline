import type { VercelCollection, VercelMenu, VercelPage, VercelProduct } from './bigcommerce/types';
import { additionalBrandCatalogProducts } from './brand-catalogs-data';
import { carharttCatalogProducts } from './carhartt-catalog-data';
import { fruitOfTheLoomCatalogProducts } from './fruit-of-the-loom-seed';
import { nikeCatalogProducts } from './nike-catalog-data';
import { patchesCatalogProducts } from './patches-catalog-data';
import { featuredCollectionsCatalogProducts } from './featured-collections-catalog-data';

/** Mobile / fallback menu — order aligned with [adesignline.com](https://www.adesignline.com/) header + footer. */
export const menu: VercelMenu[] = [
  { title: 'Brands', path: '/search/brands' },
  { title: 'Categories', path: '/search/categories' },
  { title: 'Men', path: '/search/men' },
  { title: 'Women', path: '/search/women' },
  { title: 'Featured Collections', path: '/search/promotional-products' },
  { title: 'All Promo', path: '/search' },
  { title: 'Gift Ideas', path: '/search/gift-ideas' },
  { title: 'About', path: '/pages/about' },
  { title: 'How it Works', path: '/pages/how-it-works' },
  { title: 'Contact', path: '/pages/contact' }
];

/** Matches [A Design Line](https://www.adesignline.com/) header dropdowns. “All Promo” is a single top-level link (see navbar). */
export const navigationGroups = {
  Brands: [
    { title: 'Carhartt', path: '/search/carhartt' },
    { title: 'Columbia', path: '/search/brands?q=columbia' },
    { title: 'Cutter & Buck', path: '/search/brands?q=cutter+buck' },
    { title: 'Fruit of the Loom', path: '/search/brands?q=fruit+of+the+loom' },
    { title: 'Moleskine', path: '/search/brands?q=moleskine' },
    { title: 'Nike', path: '/search/nike' },
    { title: 'Puma', path: '/search/brands?q=puma' },
    { title: 'The North Face', path: '/search/brands?q=north+face' },
    { title: 'Under Armour', path: '/search/brands?q=under+armour' }
  ],
  Categories: [
    { title: 'Polos', path: '/search/categories?q=polo' },
    { title: 'Outerwear', path: '/search/categories?q=outerwear' },
    { title: 'Activewear', path: '/search/categories?q=activewear' },
    { title: 'Layering', path: '/search/categories?q=layering' },
    { title: 'T-Shirts', path: '/search/categories?q=t-shirt' },
    { title: 'Headwear', path: '/search/categories?q=headwear' },
    { title: 'Bags', path: '/search/categories?q=bags' },
    { title: 'Woven Shirts', path: '/search/categories?q=woven+shirt' },
    { title: 'Sweatshirts', path: '/search/categories?q=sweatshirt' },
    { title: 'Sweaters', path: '/search/categories?q=sweater' },
    { title: 'Bottoms', path: '/search/categories?q=bottoms' }
  ],
  Men: [
    { title: 'Activewear', path: '/search/men?q=activewear' },
    { title: 'Bags', path: '/search/men?q=bags' },
    { title: 'Layering', path: '/search/men?q=layering' },
    { title: 'Outerwear', path: '/search/men?q=outerwear' },
    { title: 'Polos', path: '/search/men?q=polo' },
    { title: 'Bottoms', path: '/search/men?q=bottoms' },
    { title: 'Sweaters', path: '/search/men?q=sweater' },
    { title: 'Sweatshirts', path: '/search/men?q=sweatshirt' },
    { title: 'T-Shirts', path: '/search/men?q=t-shirt' }
  ],
  Women: [
    { title: 'Activewear', path: '/search/women?q=activewear' },
    { title: 'Bags', path: '/search/women?q=bags' },
    { title: 'Bottoms', path: '/search/women?q=bottoms' },
    { title: 'Layering', path: '/search/women?q=layering' },
    { title: 'Outerwear', path: '/search/women?q=outerwear' },
    { title: 'Polos', path: '/search/women?q=polo' },
    { title: 'Sweaters', path: '/search/women?q=sweater' },
    { title: 'Sweatshirts', path: '/search/women?q=sweatshirt' },
    { title: 'T-Shirts', path: '/search/women?q=t-shirt' }
  ],
  'Featured Collections': [
    { title: 'PPE', path: '/search/categories?q=ppe' },
    { title: 'Golf', path: '/search/categories?q=golf' },
    { title: 'Workwear / Uniforms', path: '/search/categories?q=workwear' },
    { title: 'Top Sellers', path: '/search/categories?q=top+sellers' }
  ]
} as const;

/** Single top-level nav target — same as live “All Promo” catalog browse. */
export const allPromoNavPath = '/search' as const;

export const collections: VercelCollection[] = [
  {
    handle: 'hidden-homepage-featured-items',
    title: 'Homepage Featured',
    description: 'Merchandise and gift-ready branded products for the homepage feature grid.',
    seo: { title: 'Homepage Featured', description: 'Homepage featured items' },
    updatedAt: new Date().toISOString(),
    path: '/collections/hidden-homepage-featured-items'
  },
  {
    handle: 'hidden-homepage-carousel',
    title: 'Homepage Carousel',
    description: 'Featured carousel merchandise.',
    seo: { title: 'Homepage Carousel', description: 'Homepage carousel items' },
    updatedAt: new Date().toISOString(),
    path: '/collections/hidden-homepage-carousel'
  },
  {
    handle: 'nike',
    title: 'Nike',
    description: 'Nike branded apparel and premium performance merchandise for team wear and brand programs.',
    seo: { title: 'Nike', description: 'Browse Nike branded apparel and merchandise.' },
    updatedAt: new Date().toISOString(),
    path: '/collections/nike'
  },
  {
    handle: 'carhartt',
    title: 'Carhartt',
    description:
      'Carhartt workwear, outerwear, bags, and apparel — durable gear for teams, uniforms, and branded programs.',
    seo: { title: 'Carhartt', description: 'Browse Carhartt branded workwear and merchandise.' },
    updatedAt: new Date().toISOString(),
    path: '/collections/carhartt'
  },
  {
    handle: 'brands',
    title: 'Brands',
    description: 'Brand-ready merchandise programs and curated branded product options.',
    seo: { title: 'Brands', description: 'Browse brand-ready merchandise and curated products.' },
    updatedAt: new Date().toISOString(),
    path: '/collections/brands'
  },
  {
    handle: 'categories',
    title: 'Categories',
    description: 'Browse apparel, drinkware, gifts, and promotional product categories.',
    seo: { title: 'Categories', description: 'Browse categories across the A Design Line catalog.' },
    updatedAt: new Date().toISOString(),
    path: '/collections/categories'
  },
  {
    handle: 'men',
    title: 'Men',
    description: 'Merchandise and apparel options commonly merchandised for men’s sizing and styling.',
    seo: { title: 'Men', description: 'Browse men’s branded apparel and products.' },
    updatedAt: new Date().toISOString(),
    path: '/collections/men'
  },
  {
    handle: 'women',
    title: 'Women',
    description: 'Merchandise and apparel options merchandised for women’s sizing and gifting programs.',
    seo: { title: 'Women', description: 'Browse women’s branded apparel and products.' },
    updatedAt: new Date().toISOString(),
    path: '/collections/women'
  },
  {
    handle: 'gift-ideas',
    title: 'Gift Ideas',
    description: 'Elevated gifting options for clients, launches, recognition, and campaigns.',
    seo: { title: 'Gift Ideas', description: 'Premium gifting and appreciation products.' },
    updatedAt: new Date().toISOString(),
    path: '/collections/gift-ideas'
  },
  {
    handle: 'promotional-products',
    title: 'Promotional Products',
    description: 'Reliable promotional products and brand staples selected for everyday visibility and gifting.',
    seo: { title: 'Promotional Products', description: 'Browse promotional products and branded staples.' },
    updatedAt: new Date().toISOString(),
    path: '/collections/promotional-products'
  },
  {
    handle: 'patches',
    title: 'Patches',
    description:
      'Custom embroidered, woven, PVC, leatherette, and specialty patches — mirrored from the A Design Line patches program.',
    seo: {
      title: 'Patches',
      description: 'Browse custom patches: embroidered, woven, PVC, dye sublimated, leatherette, and more.'
    },
    updatedAt: new Date().toISOString(),
    path: '/collections/patches'
  }
];

export const products: VercelProduct[] = [
  ...nikeCatalogProducts,
  ...carharttCatalogProducts,
  ...additionalBrandCatalogProducts,
  ...fruitOfTheLoomCatalogProducts,
  ...patchesCatalogProducts,
  ...featuredCollectionsCatalogProducts
];

export const pages: VercelPage[] = [
  {
    id: 'about',
    title: 'About',
    handle: 'about',
    body: `<p class="text-lg font-medium text-neutral-900">Let us treat your brand like our own.</p>
<p>A Design Line helps teams source premium branded merchandise, promotional products, apparel, and gifts—with embroidery, screen printing, and promotional programs built around how you actually work.</p>
<p>Whether you are building a uniform program, client gifts, or retail-ready merch, we focus on clear options, realistic timelines, and support that stays with you from idea through delivery.</p>
<p><strong>Explore the catalog:</strong> <a href="/search">All products</a> · <a href="/search/patches">Patches</a> · <a href="/search/gift-ideas">Gift ideas</a> · <a href="/pages/how-it-works">How it works</a></p>`,
    bodySummary: 'Premium branded merchandise, promo products, apparel, and gifts.',
    seo: {
      title: 'About A Design Line',
      description:
        'Learn about A Design Line — branded merchandise, embroidery, screen printing, and promotional products with a brand-first approach.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'how-it-works',
    title: 'How it Works',
    handle: 'how-it-works',
    body: `<p class="text-lg font-medium text-neutral-900">Learn about our process</p>
<p>We keep ordering straightforward: choose products that fit your brand, confirm decoration and quantities, review your proof, then we produce and ship with clear expectations at every step.</p>
<p><a href="/home/how-it-works-process.jpg" target="_blank" rel="noopener noreferrer">Open the full process infographic</a> (opens in a new tab).</p>
<p>Ready to shop? Jump into the categories that match your project:</p>
<ul>
<li><a href="/search/patches">Custom patches</a></li>
<li><a href="/search/gift-ideas">Gift ideas</a></li>
<li><a href="/search/categories?q=t-shirt">T-shirts</a> · <a href="/search/categories?q=outerwear">Outerwear</a> · <a href="/search">Full catalog</a></li>
</ul>
<p><a href="/pages/contact">Contact us</a> or <a href="/pages/quote-request">request a quote</a> when you want hands-on help.</p>
<p class="not-prose mt-10 grid gap-4 sm:grid-cols-2"><a href="/search/patches" class="block overflow-hidden rounded-xl ring-1 ring-black/10 transition hover:ring-black/20"><img src="/home/patches.webp" alt="Shop custom patches" width="640" height="400" loading="lazy" class="m-0 h-auto w-full" /></a><a href="/search/gift-ideas" class="block overflow-hidden rounded-xl ring-1 ring-black/10 transition hover:ring-black/20"><img src="/home/gift-ideas.webp" alt="Shop gift ideas" width="640" height="400" loading="lazy" class="m-0 h-auto w-full" /></a></p>`,
    bodySummary: 'Our ordering process and what to expect from proof to delivery.',
    seo: {
      title: 'How it Works | A Design Line',
      description: 'See how A Design Line handles branded merchandise—from selection and proofing through production.'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'custom-orders',
    title: 'Custom Orders',
    handle: 'custom-orders',
    body: '<p>Let us treat your brand like our own. Request custom merchandise sourcing, coordinated gifting, apparel runs, and elevated promo programs with quote-ready support.</p><p>Share your quantity, budget, timing, branding needs, and product direction so A Design Line can guide the right custom order path.</p>',
    bodySummary: 'Request custom branded merchandise and promo programs.',
    seo: { title: 'Custom Orders', description: 'Request a custom branded merchandise program or sourcing quote.' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'quote-request',
    title: 'Request a Quote',
    handle: 'quote-request',
    body: `<p>Request a quote for branded merchandise, apparel programs, or promotional orders.</p>
<p>Email <a href="mailto:angie@adesignline.com">angie@adesignline.com</a> with your timeline, quantities, decoration needs, and any product links you already have in mind.</p>
<p>Prefer to talk it through? Use our <a href="/pages/contact">contact page</a> or start browsing <a href="/search">the catalog</a>.</p>`,
    bodySummary: 'Request a quote for branded merchandise and promotional programs.',
    seo: { title: 'Request a Quote | A Design Line', description: 'Request a quote for custom branded merchandise and promotional products.' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'contact',
    title: 'Contact',
    handle: 'contact',
    body: `<p>We are here for product questions, quote support, and program planning.</p>
<p><strong>Email:</strong> <a href="mailto:angie@adesignline.com">angie@adesignline.com</a></p>
<p>For a structured quote request, visit <a href="/pages/quote-request">Request a quote</a>. To understand our workflow first, see <a href="/pages/how-it-works">How it works</a>.</p>`,
    bodySummary: 'Contact A Design Line.',
    seo: { title: 'Contact | A Design Line', description: 'Contact A Design Line for merchandise, quotes, and promotional product support.' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
