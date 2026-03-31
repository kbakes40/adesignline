/** Facet groups aligned with typical distributor / A Design Line–style catalog filters (browse + search). */

export type FacetMultiGroup = {
  id: string;
  label: string;
  options: { value: string; label: string }[];
};

export const SEARCH_RANGE_LABELS = {
  price_max: 'Price (max $)',
  production_days_max: 'Production time (days, max)',
  min_qty_max: 'Minimum quantity (max)'
} as const;

export const DIMENSION_WIDTH_IN: { value: string; label: string }[] = [
  { value: '0.75', label: '0.75' },
  { value: '3.75', label: '3.75' },
  { value: '4.5', label: '4.5' },
  { value: '5', label: '5' },
  { value: '8.5', label: '8.5' },
  { value: '22', label: '22' },
  { value: '23', label: '23' },
  { value: '28', label: '28' },
  { value: '60', label: '60' },
  { value: '84', label: '84' }
];

export const DIMENSION_LENGTH_IN: { value: string; label: string }[] = [
  { value: '7', label: '7' },
  { value: '8.5', label: '8.5' },
  { value: '9', label: '9' },
  { value: '11', label: '11' },
  { value: '13', label: '13' },
  { value: '24', label: '24' },
  { value: '26', label: '26' },
  { value: '28', label: '28' },
  { value: '32', label: '32' },
  { value: '34', label: '34' }
];

export const DIMENSION_HEIGHT_IN: { value: string; label: string }[] = [
  { value: '4', label: '4' },
  { value: '7', label: '7' },
  { value: '8.25', label: '8.25' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
  { value: '23.6', label: '23.6' },
  { value: '50', label: '50' },
  { value: '58', label: '58' }
];

export const SEARCH_MULTI_FACET_GROUPS: FacetMultiGroup[] = [
  {
    id: 'apparel_size',
    label: 'Apparel Size',
    options: [
      { value: 'xs', label: 'XS' },
      { value: 's', label: 'S' },
      { value: 'm', label: 'M' },
      { value: 'l', label: 'L' },
      { value: 'xl', label: 'XL' },
      { value: '2xl', label: '2XL' },
      { value: '3xl', label: '3XL' },
      { value: '4xl', label: '4XL' },
      { value: '5xl', label: '5XL' },
      { value: 'osfa', label: 'OSFA' }
    ]
  },
  {
    id: 'brand',
    label: 'Brand Name',
    options: [
      { value: 'augusta-sportswear', label: 'Augusta Sportswear' },
      { value: 'carhartt', label: 'Carhartt' },
      { value: 'holloway', label: 'Holloway' },
      { value: 'outdoor-cap', label: 'Outdoor Cap' },
      { value: 'pacific-headwear', label: 'Pacific Headwear' },
      { value: 'port-company', label: 'Port & Company' },
      { value: 'port-authority', label: 'Port Authority' },
      { value: 'russell-athletic', label: 'Russell Athletic' },
      { value: 'sport-tek', label: 'Sport-Tek' },
      { value: 'stormtech', label: 'Stormtech' }
    ]
  },
  {
    id: 'color_family',
    label: 'Color Family',
    options: [
      { value: 'black', label: 'Black' },
      { value: 'blue', label: 'Blue' },
      { value: 'brown', label: 'Brown' },
      { value: 'gray', label: 'Gray' },
      { value: 'green', label: 'Green' },
      { value: 'multicolor', label: 'Multicolor' },
      { value: 'orange', label: 'Orange' },
      { value: 'purple', label: 'Purple' },
      { value: 'red', label: 'Red' },
      { value: 'white', label: 'White' }
    ]
  },
  {
    id: 'decoration_method',
    label: 'Decoration Method',
    options: [
      { value: 'dye-sublimation', label: 'Dye Sublimation' },
      { value: 'embroidery', label: 'Embroidery' },
      { value: 'full-color', label: 'Full Color' },
      { value: 'heat-transfer', label: 'Heat Transfer' },
      { value: 'laser-etch', label: 'Laser Etch' },
      { value: 'screenprint', label: 'Screenprint' },
      { value: 'silk-screen', label: 'Silk Screen' },
      { value: 'spot-color', label: 'Spot Color' },
      { value: 'sublimation', label: 'Sublimation' },
      { value: 'vinyl-transfer', label: 'Vinyl Transfer' }
    ]
  },
  {
    id: 'durability',
    label: 'Durability',
    options: [
      { value: 'machine-washable', label: 'Machine Washable' },
      { value: 'water-resistant', label: 'Water Resistant' },
      { value: 'weather-resistant', label: 'Weather-Resistant' }
    ]
  },
  {
    id: 'eco_friendly',
    label: 'Eco-Friendly',
    options: [{ value: 'eco-friendly', label: 'Eco-Friendly' }]
  },
  {
    id: 'gender',
    label: 'Gender',
    options: [
      { value: 'mens', label: 'Mens' },
      { value: 'unisex', label: 'Unisex' },
      { value: 'womens', label: 'Womens' }
    ]
  },
  {
    id: 'has_blank_version',
    label: 'Has Blank Version',
    options: [{ value: 'has-blank-version', label: 'Has Blank Version' }]
  },
  {
    id: 'industry',
    label: 'Industry',
    options: [
      { value: 'collegiate', label: 'Collegiate' },
      { value: 'education', label: 'Education' },
      { value: 'gift-shop', label: 'Gift Shop' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'hotel-resort', label: 'Hotel and Resort' },
      { value: 'nonprofit', label: 'Non-Profit Organization' },
      { value: 'outreach', label: 'Outreach Group' },
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'sports', label: 'Sports' },
      { value: 'travel', label: 'Travel' }
    ]
  },
  {
    id: 'insulation',
    label: 'Insulation',
    options: [{ value: 'yes', label: 'Yes' }]
  },
  {
    id: 'is_on_closeout',
    label: 'Is On Closeout',
    options: [{ value: 'is-on-closeout', label: 'Is On Closeout' }]
  },
  {
    id: 'is_on_sale',
    label: 'Is On Sale',
    options: [{ value: 'is-on-sale', label: 'Is On Sale' }]
  },
  {
    id: 'material',
    label: 'Material',
    options: [
      { value: 'acrylic', label: 'Acrylic' },
      { value: 'cotton', label: 'Cotton' },
      { value: 'cotton-blend', label: 'Cotton Blend' },
      { value: 'cotton-poly-blend', label: 'Cotton/Poly Blend' },
      { value: 'nylon-water-repellant', label: 'Nylon with Water-Repellant Coating' },
      { value: 'poly-knit', label: 'Poly Knit Fabric' },
      { value: 'polyester', label: 'Polyester' },
      { value: 'polyester-blend', label: 'Polyester Blend' },
      { value: 'polyester-fleece', label: 'Polyester Fleece' },
      { value: 'polyester-water-repellant', label: 'Polyester with Water-Repellant Coating' }
    ]
  },
  {
    id: 'moisture_wicking',
    label: 'Moisture Wicking',
    options: [{ value: 'moisture-wicking', label: 'Moisture Wicking' }]
  },
  {
    id: 'multicolor',
    label: 'MultiColor',
    options: [
      { value: 'full-color', label: 'Full Color' },
      { value: 'full-color-available', label: 'Full Color Available' },
      { value: '1-color-included', label: '1 Color - Included' },
      { value: '1-or-2-colors-included', label: '1 or 2 Colors Included' }
    ]
  },
  {
    id: 'neckline',
    label: 'Neckline',
    options: [
      { value: 'button-down-collar', label: 'Button-Down Collar' },
      { value: 'cadet-collar', label: 'Cadet Collar' },
      { value: 'crewneck', label: 'Crewneck' },
      { value: 'deep-v-neck', label: 'Deep V-Neck' },
      { value: 'hooded', label: 'Hooded' },
      { value: 'rib-collar', label: 'Rib Collar' },
      { value: 'self-fabric-collar', label: 'Self-Fabric Collar' },
      { value: 'v-neck', label: 'V-Neck' }
    ]
  },
  {
    id: 'pocket',
    label: 'Pocket',
    options: [
      { value: 'pocket-less', label: 'Pocket-less' },
      { value: 'pocketed', label: 'Pocketed' }
    ]
  },
  {
    id: 'promocares',
    label: 'PromoCares Collection',
    options: [{ value: 'promocares-collection', label: 'PromoCares Collection' }]
  },
  {
    id: 'ringspun',
    label: 'Ringspun',
    options: [{ value: 'ringspun', label: 'Ringspun' }]
  },
  {
    id: 'shape',
    label: 'Shape',
    options: [{ value: 'rectangle', label: 'Rectangle' }]
  },
  {
    id: 'sleeve_length',
    label: 'Sleeve Length',
    options: [
      { value: 'long-sleeve', label: 'Long Sleeve' },
      { value: 'short-sleeve', label: 'Short Sleeve' },
      { value: '3-4-sleeve', label: '3/4 Sleeve' }
    ]
  },
  {
    id: 'sleeve_style',
    label: 'Sleeve Style',
    options: [
      { value: 'raglan-baseball', label: 'Raglan/Baseball' },
      { value: 'set-in-sleeve', label: 'Set-In Sleeve' },
      { value: 'sleeveless', label: 'Sleeveless' },
      { value: 'tank', label: 'Tank' }
    ]
  },
  {
    id: 'stain_resistant',
    label: 'Stain Resistant',
    options: [{ value: 'stain-resistant', label: 'Stain Resistant' }]
  },
  {
    id: 'theme',
    label: 'Theme',
    options: [
      { value: 'construction', label: 'Construction' },
      { value: 'eco-environment', label: 'Eco & Environmentally Friendly' },
      { value: 'financial-services', label: 'Financial Services' },
      { value: 'golf', label: 'Golf' },
      { value: 'health-care', label: 'Health Care' },
      { value: 'hotel-resort-theme', label: 'Hotel and Resort' },
      { value: 'organizations', label: 'Organizations' },
      { value: 'seasons', label: 'Seasons' },
      { value: 'sports-theme', label: 'Sports' },
      { value: 'sustainable', label: 'Sustainable' }
    ]
  },
  {
    id: 'trending_product',
    label: 'Trending Product',
    options: [{ value: 'trending-product', label: 'Trending Product' }]
  },
  {
    id: 'woman_owned',
    label: 'Woman Owned',
    options: [{ value: 'woman-owned', label: 'Woman Owned' }]
  },
  {
    id: 'wrinkle_resistant',
    label: 'Wrinkle Resistant',
    options: [{ value: 'wrinkle-resistant', label: 'Wrinkle Resistant' }]
  },
  {
    id: 'zipper_type',
    label: 'Zipper Type',
    options: [
      { value: 'half-zip', label: 'Half Zip' },
      { value: 'quarter-zip', label: 'Quarter Zip' },
      { value: 'zip-up', label: 'Zip Up' }
    ]
  },
  {
    id: 'made_in_usa',
    label: 'Made in USA',
    options: [{ value: 'made-in-usa', label: 'Made in USA' }]
  },
  {
    id: 'width_in',
    label: 'Product Width (IN)',
    options: DIMENSION_WIDTH_IN
  },
  {
    id: 'length_in',
    label: 'Product Length (IN)',
    options: DIMENSION_LENGTH_IN
  },
  {
    id: 'height_in',
    label: 'Product Height (IN)',
    options: DIMENSION_HEIGHT_IN
  }
];

export const ALL_MULTI_FACET_IDS = new Set(SEARCH_MULTI_FACET_GROUPS.map((g) => g.id));
