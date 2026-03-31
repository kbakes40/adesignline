import type {
  VercelProduct,
  VercelProductCatalog,
  VercelProductOption,
  VercelProductVariant
} from './bigcommerce/types';

/** Mirrors [A Design Line Nike catalog](https://www.adesignline.com/p/catalog/4c399b72-1878-4132-805c-b33ff7c236a4/nike) category buckets */
export const nikeCategoryFilters = [
  { slug: 'apparel-caps-hats', label: 'Apparel, Caps, and Hats' },
  { slug: 'awards-recognition', label: 'Awards and Recognition' },
  { slug: 'bags-totes', label: 'Backpacks, Bags, and Totes' },
  { slug: 'outdoors-sports', label: 'Outdoors, Sports, and Leisure' }
] as const;

export type NikeCategorySlug = (typeof nikeCategoryFilters)[number]['slug'];

export function nikeCategoryTag(slug: NikeCategorySlug): string {
  return `nike-cat-${slug}`;
}

const currencyCode = 'USD';

function money(amount: number) {
  return { amount: amount.toFixed(2), currencyCode };
}

const apparelOption: VercelProductOption = {
  id: 'size',
  name: 'Size',
  values: ['S', 'M', 'L', 'XL']
};

function variant(
  id: string,
  title: string,
  amount: number,
  selectedOptions: { name: string; value: string }[] = []
): VercelProductVariant {
  return {
    id,
    title,
    availableForSale: true,
    selectedOptions,
    price: money(amount)
  };
}

/** Intrinsic size hint for OG/metadata; DC source files are typically ~500–2000px wide. */
function img(url: string, altText: string) {
  return { url, altText, width: 2400, height: 2400 };
}

/** Supplier style # at end of catalog titles (e.g. NKDC1963) */
export function supplierSkuFromTitle(title: string): string | undefined {
  const m = title.match(/\b(NK[A-Z]{2,}[0-9A-Z]+)\s*$/i);
  return m?.[1];
}

function mergeCatalog(title: string, catalog?: VercelProductCatalog): VercelProductCatalog | undefined {
  const sku = catalog?.supplierSku ?? supplierSkuFromTitle(title);
  if (!sku && !catalog) return undefined;
  return { ...catalog, supplierSku: sku ?? catalog?.supplierSku };
}

/** ImagePath from Distributor Central / A Design Line catalog product records */
function nikeProduct(
  spec: {
    id: string;
    handle: string;
    title: string;
    description: string;
    descriptionHtml: string;
    price: number;
    category: NikeCategorySlug;
    imageUrl: string;
    /** Extra gallery images — use full-size carousel URLs from the live PDP, not thumbnail `ImagePath`s (~3–5KB). */
    additionalImageUrls?: string[];
    apparel?: boolean;
    tags?: string[];
    catalog?: VercelProductCatalog;
    seo: { title: string; description: string };
  }
): VercelProduct {
  const {
    id,
    handle,
    title,
    description,
    descriptionHtml,
    price,
    category,
    imageUrl,
    additionalImageUrls,
    apparel,
    tags: extraTags,
    catalog,
    seo
  } = spec;
  const urls = [imageUrl, ...(additionalImageUrls ?? [])].filter((u, i, a) => a.indexOf(u) === i);
  const images = urls.map((url, idx) => {
    if (idx === 0) return img(url, title);
    if (idx === urls.length - 1 && urls.length > 1) {
      return img(url, `${title} — back view`);
    }
    return img(url, `${title} — view ${idx + 1}`);
  });
  const featuredImage = images[0] ?? img(imageUrl, title);
  const opts = apparel ? [apparelOption] : ([] as VercelProductOption[]);
  const variants = apparel
    ? ['S', 'M', 'L', 'XL'].map((size) =>
        variant(`${id}-${size.toLowerCase()}`, `${title} / ${size}`, price, [{ name: 'Size', value: size }])
      )
    : [variant(`${id}-default`, title, price)];

  return {
    id,
    handle: `/product/${handle}`,
    availableForSale: true,
    title,
    description,
    descriptionHtml,
    options: opts,
    priceRange: { minVariantPrice: money(price), maxVariantPrice: money(price) },
    variants,
    featuredImage,
    images: images.length ? images : [featuredImage],
    seo,
    catalog: mergeCatalog(title, catalog),
    tags: [
      'nike',
      'brands',
      'categories',
      'men',
      'women',
      nikeCategoryTag(category),
      ...(extraTags ?? [])
    ],
    updatedAt: new Date().toISOString()
  };
}

/** Curated from the live Nike promotional catalog (names, SKUs, pricing, copy). */
export const nikeCatalogProducts: VercelProduct[] = [
  nikeProduct({
    id: 'nk-nkdc1963',
    handle: 'nike-dri-fit-micro-pique-2-polo-nkdc1963',
    title: 'Nike Dri-FIT Micro Pique 2.0 Polo NKDC1963',
    description: '1 day production time. Tall sizes available in select colors. Best-selling Nike polo with Dri-FIT moisture management.',
    descriptionHtml: `<p>Tall sizes available in select colors: Anthracite, Black, Cool Grey, Game Royal, Gym Blue, Navy, University Red, Valor Blue, White</p>
<p>The best-selling Nike polo just got better. Still engineered from soft, stretchable micro pique fabric, the Nike Dri-FIT Micro Pique 2.0 Polo is now 5 styles strong. It delivers unparalleled comfort with Dri-FIT moisture management technology and features updated design lines and fit. Flat knit collar and three-button placket. Rolled-forward shoulder seams, open hem sleeves and open hem. White or black pearlized buttons selected to complement the shirt color. Contrast Swoosh logo is embroidered on the left sleeve. Made of 4.3-ounce, 100% polyester Dri-FIT fabric.</p>
<p><strong>Additional decoration charges may apply.</strong></p>`,
    price: 48.02,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/1/B/1B145967840A181D0A1C945459F8AE0E.jpg',
    additionalImageUrls: [
      'https://s3.distributorcentral.com/uploads/5/6/565824319F0ED4A635C1966575295345.jpg',
      'https://s3.distributorcentral.com/uploads/B/B/BB2E653C11D4F376DB9C77E8CCD8FC5B.jpg',
      'https://s3.distributorcentral.com/uploads/2/7/2796A2669DEB3B2977E2C422A1791293.jpg',
      'https://s3.distributorcentral.com/uploads/8/E/8E9B95C3BA214A7C68677C3660704C65.jpg',
      'https://s3.distributorcentral.com/uploads/D/0/D0CB08FD5574E505D6066096363A4BB4.jpg'
    ],
    apparel: true,
    catalog: {
      supplierSku: 'NKDC1963',
      productionDays: 1,
      minQuantity: 1,
      weightDisplay: '7.04 OZ',
      dimensionsDisplay: '0 L × 0 W × 0 H',
      featureBullets: [
        'The best-selling Nike polo just got better. Still engineered from soft, stretchable micro pique fabric, the Nike Dri-FIT Micro Pique 2.0 Polo is now 5 styles strong.',
        'It delivers unparalleled comfort with Dri-FIT moisture management technology and features updated design lines and fit. Flat knit collar and three-button placket.'
      ]
    },
    seo: {
      title: 'Nike Dri-FIT Micro Pique 2.0 Polo',
      description: 'Nike Dri-FIT Micro Pique 2.0 Polo — branded apparel.'
    }
  }),
  nikeProduct({
    id: 'nk-nkfz6128',
    handle: 'nike-commute-backpack-nkfz6128',
    title: 'Nike Commute Backpack NKFZ6128',
    description: '400D nylon/poly body. Two-way zipper main compartment, laptop sleeve fits most 15" laptops. 25 L.',
    descriptionHtml: '<p>Designed to carry whatever your day needs — fashion, function and flexibility with contrast embroidered Swoosh.</p>',
    price: 97.0,
    category: 'bags-totes',
    imageUrl: 'https://s3.distributorcentral.com/uploads/B/D/BD84E56659C3CD512445EE670151B2BB.jpg',
    seo: { title: 'Nike Commute Backpack', description: 'Nike Commute branded backpack.' }
  }),
  nikeProduct({
    id: 'nk-nkfz6132',
    handle: 'nike-commute-sling-bag-nkfz6132',
    title: 'Nike Commute Sling Bag NKFZ6132',
    description: 'Adjustable strap for right or left carry. Padded tablet pocket. 8 L capacity.',
    descriptionHtml: '<p>Balances fashion, function and flexibility for everyday carry.</p>',
    price: 75.0,
    category: 'bags-totes',
    imageUrl: 'https://s3.distributorcentral.com/uploads/C/A/CA12BE5489CFECFBD11F87078408A606.jpg',
    seo: { title: 'Nike Commute Sling Bag', description: 'Nike Commute sling bag.' }
  }),
  nikeProduct({
    id: 'nk-nkfz6133',
    handle: 'nike-commute-crossbody-nkfz6133',
    title: 'Nike Commute Crossbody NKFZ6133',
    description: 'Compact crossbody with adjustable strap and organized pockets. 1 L.',
    descriptionHtml: '<p>Designed for whatever your day needs with a padded back panel.</p>',
    price: 38.0,
    category: 'bags-totes',
    imageUrl: 'https://s3.distributorcentral.com/uploads/5/F/5F4982D168DF89D0536808E0B4C4327F.jpg',
    seo: { title: 'Nike Commute Crossbody', description: 'Nike Commute crossbody bag.' }
  }),
  nikeProduct({
    id: 'nk-nkfz6130',
    handle: 'nike-commute-tote-nkfz6130',
    title: 'Nike Commute Tote NKFZ6130',
    description: 'Versatile tote with laptop compartment. 20 L. Two-way zipper main compartment.',
    descriptionHtml: '<p>Balancing fashion, function and flexibility — carry across body or over shoulders.</p>',
    price: 82.0,
    category: 'bags-totes',
    imageUrl: 'https://s3.distributorcentral.com/uploads/2/B/2BA1B6166511B4E6DC4FC620276F2A44.jpg',
    seo: { title: 'Nike Commute Tote', description: 'Nike Commute tote bag.' }
  }),
  nikeProduct({
    id: 'nk-nkhm7926',
    handle: 'nike-full-zip-soft-shell-jacket-nkhm7926',
    title: 'Nike Full-Zip Soft Shell Jacket NKHM7926',
    description: 'Water-repellent soft shell with stretch. 7.9 oz polyester/elastane. Three-panel hood.',
    descriptionHtml: '<p>Take outdoor workouts to the next level with moisture management and heat transfer Swoosh logo.</p>',
    price: 127.2,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/5/0/50E7269C995D5CD6E06D7BB84D5A2744.jpg',
    apparel: true,
    seo: { title: 'Nike Full-Zip Soft Shell Jacket', description: 'Nike soft shell jacket.' }
  }),
  nikeProduct({
    id: 'nk-nkhm7969',
    handle: 'nike-womens-essential-half-zip-cover-up-nkhm7969',
    title: "Nike Women's Essential 1/2-Zip Cover-Up NKHM7969",
    description: '5.3 oz polyester with recycled content. Dri-FIT technology. Embroidered Swoosh at sleeve.',
    descriptionHtml: '<p>Running, training or out and about — cool, comfortable and stylish.</p>',
    price: 81.9,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/5/E/5E84571A5DE3974D6BD97263F6D65A52.jpg',
    apparel: true,
    tags: ['women'],
    seo: { title: "Nike Women's Essential 1/2-Zip Cover-Up", description: 'Nike women cover-up.' }
  }),
  nikeProduct({
    id: 'nk-nkhm8045',
    handle: 'nike-club-fleece-jogger-nkhm8045',
    title: 'Nike Club Fleece Jogger NKHM8045',
    description: '8.2 oz cotton/poly fleece. Interior drawstrings, ribbed cuffs, embroidered Swoosh on leg.',
    descriptionHtml: '<p>Warmth, style and performance whether you are running laps or errands.</p>',
    price: 52.0,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/C/1/C1F40FEC865776B18A5CF0351551588F.jpg',
    apparel: true,
    seo: { title: 'Nike Club Fleece Jogger', description: 'Nike Club Fleece jogger.' }
  }),
  nikeProduct({
    id: 'nk-nkhm7937',
    handle: 'nike-womens-full-zip-soft-shell-jacket-nkhm7937',
    title: "Nike Women's Full-Zip Soft Shell Jacket NKHM7937",
    description: 'Water-repellent soft shell. Three-panel hood and zippered mesh-lined pockets.',
    descriptionHtml: '<p>Same premium soft shell construction tuned for women’s programs.</p>',
    price: 127.2,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/9/3/93EC3AD0141EDACD233BEA9BB18C1FC1.jpg',
    apparel: true,
    tags: ['women'],
    seo: { title: "Nike Women's Full-Zip Soft Shell Jacket", description: 'Nike women soft shell.' }
  }),
  nikeProduct({
    id: 'nk-nkhq4550',
    handle: 'nike-team-rlegend-long-sleeve-tee-nkhq4550',
    title: 'Nike Team rLegend Long Sleeve Tee NKHQ4550',
    description: '4 oz recycled polyester jersey. Dri-FIT. Heat-transfer Swoosh on chest.',
    descriptionHtml: '<p>Sustainable recycled polyester with peak performance and lower environmental impact.</p>',
    price: 34.65,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/C/C/CCAD13508C8FFBE820C64DF7915ADD7B.jpg',
    apparel: true,
    seo: { title: 'Nike Team rLegend Long Sleeve Tee', description: 'Nike long sleeve tee.' }
  }),
  nikeProduct({
    id: 'nk-nkhm8036',
    handle: 'nike-essential-half-zip-cover-up-nkhm8036',
    title: 'Nike Essential 1/2-Zip Cover-Up NKHM8036',
    description: '5.3 oz recycled polyester. Dri-FIT. Dyed-to-match zippers.',
    descriptionHtml: '<p>Half-zip cover-up for training and everyday wear.</p>',
    price: 81.9,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/5/F/5F3927A37FC76D8CFBDC822518A4CC29.jpg',
    apparel: true,
    seo: { title: 'Nike Essential 1/2-Zip Cover-Up', description: 'Nike essential cover-up.' }
  }),
  nikeProduct({
    id: 'nk-nkn1003478',
    handle: 'nike-air-hybrid-2-golf-bag-nkn1003478',
    title: 'Nike Air Hybrid 2 Golf Bag NKN1003478',
    description: '14-way divider, 7 pockets, insulated cooler pocket, Air Max dual straps. 5.28 lbs.',
    descriptionHtml: '<p>Lightweight durable aluminum stand construction with waterproof valuable pocket.</p>',
    price: 304.29,
    category: 'outdoors-sports',
    imageUrl: 'https://s3.distributorcentral.com/uploads/0/9/0939D9F32C925059C3CBC7E5E3BD649F.jpg',
    seo: { title: 'Nike Air Hybrid 2 Golf Bag', description: 'Nike Air Hybrid golf bag.' }
  }),
  nikeProduct({
    id: 'nk-nkfq4793',
    handle: 'nike-womens-dri-fit-smooth-heather-polo-nkfq4793',
    title: "Nike Women's Dri-FIT Smooth Heather Polo NKFQ4793",
    description: '4.4 oz polyester with recycled content. Self-fabric collar, open neck placket.',
    descriptionHtml: '<p>Subtle heather pattern with sustainability and stretch.</p>',
    price: 63.93,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/B/1/B1CC3531453B7BE2C79D5E8F8116857C.jpg',
    apparel: true,
    tags: ['women'],
    seo: { title: "Nike Women's Dri-FIT Smooth Heather Polo", description: 'Nike women heather polo.' }
  }),
  nikeProduct({
    id: 'nk-nkfq4792',
    handle: 'nike-dri-fit-striated-polo-nkfq4792',
    title: 'Nike Dri-FIT Striated Polo NKFQ4792',
    description: '4.9 oz recycled polyester. Striated print with Dri-FIT technology.',
    descriptionHtml: '<p>Stand out on the green or on the town.</p>',
    price: 63.93,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/E/6/E6C31948BD40544DF3E1D396E8FD9786.jpg',
    apparel: true,
    seo: { title: 'Nike Dri-FIT Striated Polo', description: 'Nike striated polo.' }
  }),
  nikeProduct({
    id: 'nk-nkfq4794',
    handle: 'nike-dri-fit-smooth-heather-polo-nkfq4794',
    title: 'Nike Dri-FIT Smooth Heather Polo NKFQ4794',
    description: '4.4 oz recycled polyester. Three-button placket.',
    descriptionHtml: '<p>Unparalleled Nike performance with subtle heather pattern.</p>',
    price: 63.93,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/F/7/F7AB0CB305C1A140033D18EBECC5898B.jpg',
    apparel: true,
    seo: { title: 'Nike Dri-FIT Smooth Heather Polo', description: 'Nike smooth heather polo.' }
  }),
  nikeProduct({
    id: 'nk-nkfz2608',
    handle: 'nike-brasilia-camo-backpack-nkfz2608',
    title: 'LIMITED EDITION Nike Brasilia Camo Backpack NKFZ2608',
    description: 'Pixelated digital camo. Laptop sleeve, water-resistant bottom. 24 L.',
    descriptionHtml: '<p>Constructed of at least 65% recycled material.</p>',
    price: 56.5,
    category: 'bags-totes',
    imageUrl: 'https://s3.distributorcentral.com/uploads/4/0/4030F5BF9858CC6CCC1DD19F26102D25.jpg',
    seo: { title: 'Nike Brasilia Camo Backpack', description: 'Limited Nike Brasilia camo backpack.' }
  }),
  nikeProduct({
    id: 'nk-nkfz2610',
    handle: 'nike-brasilia-camo-duffel-nkfz2610',
    title: 'LIMITED EDITION Nike Brasilia Camo Duffel NKFZ2610',
    description: 'Spacious duffel with shoe compartment and shoulder strap. 9.5 L.',
    descriptionHtml: '<p>Digital camo print with organized storage.</p>',
    price: 47.82,
    category: 'bags-totes',
    imageUrl: 'https://s3.distributorcentral.com/uploads/5/D/5DF9F9BFB1FC55A5E260015A6447DA21.jpg',
    seo: { title: 'Nike Brasilia Camo Duffel', description: 'Limited Nike Brasilia camo duffel.' }
  }),
  nikeProduct({
    id: 'nk-nkfn4208',
    handle: 'nike-utility-duffel-2-nkfn4208',
    title: 'Nike Utility Duffel 2.0 NKFN4208',
    description: 'Thermal insulated pocket, shoe pocket, 51 L. At least 65% recycled material.',
    descriptionHtml: '<p>Keeps gear organized for any active day.</p>',
    price: 81.52,
    category: 'bags-totes',
    imageUrl: 'https://s3.distributorcentral.com/uploads/8/8/88FDE165018AD231B51F62F20B782C22.jpg',
    seo: { title: 'Nike Utility Duffel 2.0', description: 'Nike Utility duffel.' }
  }),
  nikeProduct({
    id: 'nk-nkfq4762',
    handle: 'nike-tech-fleece-full-zip-hoodie-nkfq4762',
    title: 'Nike Tech Fleece Full-Zip Hoodie NKFQ4762',
    description: '9.1 oz Nike Tech Fleece. Zippered pockets, contrast Swoosh on sleeve.',
    descriptionHtml: '<p>Premium top-selling icon — warm, soft and smooth on both sides.</p>',
    price: 149.97,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/1/6/16D3AF747741490CBB37917F8ABB52CD.jpg',
    apparel: true,
    seo: { title: 'Nike Tech Fleece Full-Zip Hoodie', description: 'Nike Tech Fleece hoodie.' }
  }),
  nikeProduct({
    id: 'nk-nkfq4758',
    handle: 'nike-track-jacket-nkfq4758',
    title: 'Nike Track Jacket NKFQ4758',
    description: 'Dual white piping, zip-through cadet collar, embroidered Swoosh center back.',
    descriptionHtml: '<p>8.7 oz 100% polyester Nike icon.</p>',
    price: 98.73,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/4/C/4C92D8E90C12A0EC8269FE42700D657A.jpg',
    apparel: true,
    seo: { title: 'Nike Track Jacket', description: 'Nike track jacket.' }
  }),
  nikeProduct({
    id: 'nk-nkfq4759',
    handle: 'nike-bomber-jacket-nkfq4759',
    title: 'Nike Bomber Jacket NKFQ4759',
    description: 'Rib knit collar and cuffs, 5 oz cotton/nylon. Embroidered Swoosh on sleeve.',
    descriptionHtml: '<p>Clean classic bomber for almost anywhere.</p>',
    price: 93.27,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/B/B/BB03905FDED87F0C390BB3D3B096A869.jpg',
    apparel: true,
    seo: { title: 'Nike Bomber Jacket', description: 'Nike bomber jacket.' }
  }),
  nikeProduct({
    id: 'nk-nkfn4106',
    handle: 'nike-utility-speed-backpack-2-nkfn4106',
    title: 'Nike Utility Speed Backpack 2.0 NKFN4106',
    description: 'Opens flat for access. Laptop up to 16", luggage pass-through. 27 L.',
    descriptionHtml: '<p>PU-coated polyester for commuting and travel.</p>',
    price: 92.38,
    category: 'bags-totes',
    imageUrl: 'https://s3.distributorcentral.com/uploads/5/3/53B6AADEFC0E2976619AC6093330CFA7.jpg',
    seo: { title: 'Nike Utility Speed Backpack 2.0', description: 'Nike Utility Speed backpack.' }
  }),
  nikeProduct({
    id: 'nk-nkfq4798',
    handle: 'nike-womens-tech-fleece-full-zip-hoodie-nkfq4798',
    title: "Nike Women's Tech Fleece Full-Zip Hoodie NKFQ4798",
    description: 'Women’s Tech Fleece with rib knit cuffs and high-low hem.',
    descriptionHtml: '<p>Premium icon tuned for women’s fit.</p>',
    price: 149.97,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/0/B/0B2D5FE7F0B3AD2C932FE2281409DB41.jpg',
    apparel: true,
    tags: ['women'],
    seo: { title: "Nike Women's Tech Fleece Full-Zip Hoodie", description: 'Nike women Tech Fleece hoodie.' }
  }),
  nikeProduct({
    id: 'nk-nkfq4761',
    handle: 'nike-pro-hooded-jacket-nkfq4761',
    title: 'Nike Pro Hooded Jacket NKFQ4761',
    description: '3.5 oz Dri-FIT polyester/elastane. Zippered pockets, Nike Pro branded hem.',
    descriptionHtml: '<p>Developed for training and beyond.</p>',
    price: 98.73,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/7/3/735EF3C3ABB4716B829A1F840C8DF1B2.jpg',
    apparel: true,
    seo: { title: 'Nike Pro Hooded Jacket', description: 'Nike Pro hooded jacket.' }
  }),
  nikeProduct({
    id: 'nk-nkfq3968',
    handle: 'nike-dri-fit-victory-colorblock-polo-nkfq3968',
    title: 'Nike Dri-FIT Victory Colorblock Polo NKFQ3968',
    description: '4 oz recycled polyester Dri-FIT. Colorblocking with anti-curl collar.',
    descriptionHtml: '<p>Sustainable victory with standout colorblocking.</p>',
    price: 63.93,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/C/4/C441568B798D46D996ED8F6E48CBC71C.jpg',
    apparel: true,
    seo: { title: 'Nike Dri-FIT Victory Colorblock Polo', description: 'Nike Victory colorblock polo.' }
  }),
  nikeProduct({
    id: 'nk-nkfd9735',
    handle: 'nike-therma-fit-pocket-pullover-fleece-hoodie-nkfd9735',
    title: 'Nike Therma-FIT Pocket Pullover Fleece Hoodie NKFD9735',
    description: '7.4 oz Therma-FIT polyester. Zippered arm pocket, pouch pocket.',
    descriptionHtml: '<p>Therma-FIT helps manage natural heat in cold conditions.</p>',
    price: 65.2,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/B/6/B660C1BA7E39CEA7EF0C87DF4707E165.jpg',
    apparel: true,
    seo: { title: 'Nike Therma-FIT Pocket Pullover Fleece Hoodie', description: 'Nike Therma-FIT hoodie.' }
  }),
  nikeProduct({
    id: 'nk-nkdm3982',
    handle: 'nike-brasilia-modular-tote-nkdm3982',
    title: 'Nike Brasilia Modular Tote NKDM3982',
    description: '11 L modular tote. At least 65% recycled material. Side grab handle.',
    descriptionHtml: '<p>Right size for anyone on the go — stows inside other bags.</p>',
    price: 22.77,
    category: 'bags-totes',
    imageUrl: 'https://s3.distributorcentral.com/uploads/6/E/6E7C1F80D2F367A4C6E554F052F7629F.jpg',
    seo: { title: 'Nike Brasilia Modular Tote', description: 'Nike Brasilia modular tote.' }
  }),
  nikeProduct({
    id: 'nk-nkfd9863',
    handle: 'nike-club-fleece-sleeve-swoosh-crew-nkfd9863',
    title: 'Nike Club Fleece Sleeve Swoosh Crew NKFD9863',
    description: '8.3 oz cotton/poly fleece. Embroidered Swoosh on sleeve.',
    descriptionHtml: '<p>Lightweight brushed back for extra soft interior.</p>',
    price: 54.33,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/9/9/9967C41D3F110CEEA0543A762B4EF8A6.jpg',
    apparel: true,
    seo: { title: 'Nike Club Fleece Sleeve Swoosh Crew', description: 'Nike Club Fleece crew.' }
  }),
  nikeProduct({
    id: 'nk-nkfd9892',
    handle: 'nike-dri-fit-corporate-half-zip-nkfd9892',
    title: 'Nike Dri-FIT Corporate 1/2-Zip NKFD9892',
    description: '8.3 oz Dri-FIT polyester. Cadet collar, faux leather zipper pull.',
    descriptionHtml: '<p>Looks and feels like your favorite sweater, ready to perform.</p>',
    price: 108.68,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/D/C/DC8DC10E77A011B1538BED363B7A8B1B.jpg',
    apparel: true,
    seo: { title: 'Nike Dri-FIT Corporate 1/2-Zip', description: 'Nike Corporate half-zip.' }
  }),
  nikeProduct({
    id: 'nk-nkfd9890',
    handle: 'nike-womens-club-fleece-sleeve-swoosh-full-zip-hoodie-nkfd9890',
    title: "Nike Women's Club Fleece Sleeve Swoosh Full-Zip Hoodie NKFD9890",
    description: '8.3 oz Club Fleece. Three-panel hood, front pockets, embroidered Swoosh.',
    descriptionHtml: '<p>Versatile brushed-back hoodie for work or play.</p>',
    price: 65.2,
    category: 'apparel-caps-hats',
    imageUrl: 'https://s3.distributorcentral.com/uploads/5/1/518E2C1292BDA75435EA0966E84CC3BF.jpg',
    apparel: true,
    tags: ['women'],
    seo: { title: "Nike Women's Club Fleece Full-Zip Hoodie", description: 'Nike women Club Fleece hoodie.' }
  })
];

export function countNikeProductsByCategory(products: VercelProduct[]): Record<NikeCategorySlug, number> {
  const nike = products.filter((p) => p.tags.includes('nike'));
  const initial = {} as Record<NikeCategorySlug, number>;
  for (const { slug } of nikeCategoryFilters) {
    initial[slug] = nike.filter((p) => p.tags.includes(nikeCategoryTag(slug))).length;
  }
  return initial;
}
