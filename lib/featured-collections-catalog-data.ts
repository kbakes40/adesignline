import type { VercelProduct } from './bigcommerce/types';
import data from './data/featured-collections.json';

export const featuredCollectionsCatalogProducts: VercelProduct[] = data as VercelProduct[];
