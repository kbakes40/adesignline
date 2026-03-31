import type { VercelProduct } from './bigcommerce/types';
import data from './data/patches-catalog.json';

/** Patches — 273 SKUs. Data lives in lib/data/patches-catalog.json. */
export const patchesCatalogProducts: VercelProduct[] = data as VercelProduct[];
