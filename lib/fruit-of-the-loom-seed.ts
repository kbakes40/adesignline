import type { VercelProduct } from './bigcommerce/types';
import { brandCatalogProduct } from './brand-catalog-product';

/**
 * The live ADL `/fruit-of-the-loom` catalog slug currently resolves to the full site index (~116k SKUs).
 * These rows mirror typical FOL styles so `/search/brands?q=fruit+of+the+loom` has real inventory.
 */
export const fruitOfTheLoomCatalogProducts: VercelProduct[] = [
  brandCatalogProduct({
    id: 'fol-3930',
    handle: 'fruit-of-the-loom-heavy-cotton-hd-t-shirt-3930',
    title: 'Fruit of the Loom Heavy Cotton HD T-Shirt — 3930',
    description:
      'Heavy Cotton HD tee for retail-quality decoration. Tearaway label. 100% cotton pre-shrunk jersey.',
    descriptionHtml:
      '<p>Heavy Cotton HD tee for retail-quality decoration. Tearaway label. 100% cotton pre-shrunk jersey.</p>',
    price: 6.25,
    imageUrl: 'https://s3.distributorcentral.com/uploads/4/3/43A1E144D297D142ED75E0DC2970BCDE.jpg',
    supplierSku: '3930',
    productionDays: 5,
    minQuantity: 12,
    brandSlug: 'fruit-of-the-loom'
  }),
  brandCatalogProduct({
    id: 'fol-4930',
    handle: 'fruit-of-the-loom-heavy-cotton-pocket-t-shirt-4930',
    title: 'Fruit of the Loom Heavy Cotton Pocket T-Shirt — 4930',
    description: 'Pocket tee with matching pocket and tearaway label. 100% cotton.',
    descriptionHtml: '<p>Pocket tee with matching pocket and tearaway label. 100% cotton.</p>',
    price: 8.4,
    imageUrl: 'https://s3.distributorcentral.com/uploads/5/3/5325672510D188532D3E132212282308.jpg',
    supplierSku: '4930',
    productionDays: 5,
    minQuantity: 12,
    brandSlug: 'fruit-of-the-loom'
  }),
  brandCatalogProduct({
    id: 'fol-sf76r',
    handle: 'fruit-of-the-loom-sofspun-crewneck-sweatshirt-sf76r',
    title: 'Fruit of the Loom SofSpun Crewneck Sweatshirt — SF76R',
    description: 'SofSpun fleece crew with rib cuffs and waistband. Cotton-rich blend.',
    descriptionHtml: '<p>SofSpun fleece crew with rib cuffs and waistband. Cotton-rich blend.</p>',
    price: 18.9,
    imageUrl: 'https://s3.distributorcentral.com/uploads/A/8/A86B1CC19C45B8E3D810CE11A94702D6.jpg',
    supplierSku: 'SF76R',
    productionDays: 7,
    minQuantity: 12,
    brandSlug: 'fruit-of-the-loom'
  }),
  brandCatalogProduct({
    id: 'fol-sf72r',
    handle: 'fruit-of-the-loom-sofspun-hoodie-sf72r',
    title: 'Fruit of the Loom SofSpun Hooded Sweatshirt — SF72R',
    description: 'SofSpun fleece hoodie with pouch pocket and matching drawcord.',
    descriptionHtml: '<p>SofSpun fleece hoodie with pouch pocket and matching drawcord.</p>',
    price: 24.5,
    imageUrl: 'https://s3.distributorcentral.com/uploads/2/0/20742990E7242B089933B45EBF50778B.jpg',
    supplierSku: 'SF72R',
    productionDays: 7,
    minQuantity: 12,
    brandSlug: 'fruit-of-the-loom'
  }),
  brandCatalogProduct({
    id: 'fol-39mr',
    handle: 'fruit-of-the-loom-heavy-cotton-long-sleeve-tee-39mr',
    title: 'Fruit of the Loom Heavy Cotton Long Sleeve T-Shirt — 39MR',
    description: 'Long sleeve Heavy Cotton jersey with rib cuffs. Tearaway label.',
    descriptionHtml: '<p>Long sleeve Heavy Cotton jersey with rib cuffs. Tearaway label.</p>',
    price: 9.15,
    imageUrl: 'https://s3.distributorcentral.com/uploads/4/3/43A1E144D297D142ED75E0DC2970BCDE.jpg',
    supplierSku: '39MR',
    productionDays: 5,
    minQuantity: 12,
    brandSlug: 'fruit-of-the-loom'
  }),
  brandCatalogProduct({
    id: 'fol-472p',
    handle: 'fruit-of-the-loom-iconic-tee-472p',
    title: 'Fruit of the Loom Iconic T-Shirt — 472P',
    description: 'Lightweight Iconic tee with shoulder-to-shoulder tape. Soft hand.',
    descriptionHtml: '<p>Lightweight Iconic tee with shoulder-to-shoulder tape. Soft hand.</p>',
    price: 5.95,
    imageUrl: 'https://s3.distributorcentral.com/uploads/5/3/5325672510D188532D3E132212282308.jpg',
    supplierSku: '472P',
    productionDays: 5,
    minQuantity: 12,
    brandSlug: 'fruit-of-the-loom'
  }),
  brandCatalogProduct({
    id: 'fol-82130',
    handle: 'fruit-of-the-loom-5oz-cotton-canvas-tote-82130',
    title: 'Fruit of the Loom 5 oz. Cotton Canvas Tote — 82130',
    description: 'Economy cotton canvas tote for events and retail decoration.',
    descriptionHtml: '<p>Economy cotton canvas tote for events and retail decoration.</p>',
    price: 4.25,
    imageUrl: 'https://s3.distributorcentral.com/uploads/B/9/B901CFC7D984E2D31F1F2630108BF062.jpg',
    supplierSku: '82130',
    productionDays: 5,
    minQuantity: 24,
    brandSlug: 'fruit-of-the-loom'
  }),
  brandCatalogProduct({
    id: 'fol-4930p',
    handle: 'fruit-of-the-loom-v-neck-heavy-cotton-4930v',
    title: 'Fruit of the Loom Heavy Cotton V-Neck T-Shirt — 4930V',
    description: 'V-neck Heavy Cotton tee with mitered V and tearaway label.',
    descriptionHtml: '<p>V-neck Heavy Cotton tee with mitered V and tearaway label.</p>',
    price: 7.1,
    imageUrl: 'https://s3.distributorcentral.com/uploads/4/3/43A1E144D297D142ED75E0DC2970BCDE.jpg',
    supplierSku: '4930V',
    productionDays: 5,
    minQuantity: 12,
    brandSlug: 'fruit-of-the-loom'
  })
];
