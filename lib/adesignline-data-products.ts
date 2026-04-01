import type { VercelProduct } from './bigcommerce/types';
import { additionalBrandCatalogProducts } from './brand-catalogs-data';
import { carharttCatalogProducts } from './carhartt-catalog-data';
import { fruitOfTheLoomCatalogProducts } from './fruit-of-the-loom-seed';
import { nikeCatalogProducts } from './nike-catalog-data';
import { patchesCatalogProducts } from './patches-catalog-data';
import { featuredCollectionsCatalogProducts } from './featured-collections-catalog-data';

export const products: VercelProduct[] = [
  ...nikeCatalogProducts,
  ...carharttCatalogProducts,
  ...additionalBrandCatalogProducts,
  ...fruitOfTheLoomCatalogProducts,
  ...patchesCatalogProducts,
  ...featuredCollectionsCatalogProducts
];
