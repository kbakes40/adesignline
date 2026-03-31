import {
    catalogCategorySlugs,
    collectionsWithCatalogCategoryParam,
    productMatchesCatalogCategory,
    type CatalogCategorySlug
} from 'lib/collection-category-filters';
import { VercelSortKeys } from 'lib/constants';
import { nikeCategoryTag, type NikeCategorySlug } from 'lib/nike-catalog-data';
import { sortProducts } from 'lib/product-sort';
import { productMatchesQuery, sortProductsByRelevance } from 'lib/search/rank';
import {
    applyFacetFilters,
    type FacetFilterState
} from 'lib/search-facet-engine';
import { isSupabaseCatalogEnabled } from 'lib/supabase/env';
import {
    getProductDetailPayloadByHandle,
    getProductDetailPayloadBySlug
} from 'lib/supabase/products/detail';
import { notFound } from 'next/navigation';
import { collections, menu, pages, products } from '../adesignline-data';
import { appendCartLines, getHydratedCart, removeLinesByIds, updateLineQuantity } from '../cart-local';
import { getRelatedProductsForProduct } from '../related-products';
import type {
    LineItemCustomization,
    VercelCart,
    VercelCollection,
    VercelMenu,
    VercelPage,
    VercelProduct
} from './types';

function normalizeHandle(handle: string | undefined) {
  if (handle == null) return '';
  return handle.replace(/^\//, '');
}

export async function getMenu(_menuHandle: string): Promise<VercelMenu[]> {
  void _menuHandle;
  return menu;
}

export async function getCollections(): Promise<VercelCollection[]> {
  return collections.filter((collection) => !collection.handle.startsWith('hidden-'));
}

export async function getCollection(handle: string): Promise<VercelCollection | undefined> {
  return collections.find((collection) => normalizeHandle(collection.handle) === normalizeHandle(handle));
}

const nikeCategorySlugs = new Set<string>([
  'apparel-caps-hats',
  'awards-recognition',
  'bags-totes',
  'outdoors-sports'
]);

export async function getCollectionProducts({
  collection,
  sortKey = 'RELEVANCE',
  reverse = false,
  category,
  query,
  facetState
}: {
  collection: string;
  sortKey?: keyof typeof VercelSortKeys;
  reverse?: boolean;
  /** Nike catalog sidebar — slug from `nikeCategoryFilters` */
  category?: string;
  /** Narrow `/search/brands` (and other collections) by title/description/tags, e.g. `?q=puma` */
  query?: string;
  facetState?: FacetFilterState;
}): Promise<VercelProduct[]> {
  let filtered = products.filter((product) => product.tags.includes(collection));
  if (query?.trim()) {
    filtered = filtered.filter((product) => productMatchesQuery(product, query));
  }
  if (collection === 'nike' && category && nikeCategorySlugs.has(category)) {
    const tag = nikeCategoryTag(category as NikeCategorySlug);
    filtered = filtered.filter((product) => product.tags.includes(tag));
  }
  if (
    collectionsWithCatalogCategoryParam.has(collection) &&
    category &&
    catalogCategorySlugs.has(category)
  ) {
    filtered = filtered.filter((p) =>
      productMatchesCatalogCategory(p, category as CatalogCategorySlug)
    );
  }
  filtered = applyFacetFilters(filtered, facetState);
  if (query?.trim() && sortKey === 'RELEVANCE') {
    return sortProductsByRelevance(filtered, query);
  }
  return sortProducts(filtered, sortKey, reverse);
}

export async function getProducts({
  query,
  sortKey = 'RELEVANCE',
  reverse = false,
  facetState
}: {
  sortKey?: keyof typeof VercelSortKeys;
  reverse?: boolean;
  query?: string;
  facetState?: FacetFilterState;
} = {}): Promise<VercelProduct[]> {
  let filtered = products;
  if (query?.trim()) {
    filtered = filtered.filter((product) => productMatchesQuery(product, query));
  }
  filtered = applyFacetFilters(filtered, facetState);
  if (query?.trim() && sortKey === 'RELEVANCE') {
    return sortProductsByRelevance(filtered, query);
  }
  return sortProducts(filtered, sortKey, reverse);
}

export async function getProduct(handle: string): Promise<VercelProduct | undefined> {
  if (isSupabaseCatalogEnabled()) {
    const fromDb =
      (await getProductDetailPayloadByHandle(handle)) ?? (await getProductDetailPayloadBySlug(handle));
    if (fromDb) return fromDb;
  }
  const normalized = normalizeHandle(handle);
  return products.find((item) => {
    const p = normalizeHandle(item.handle);
    return p === normalized || p.split('/').pop() === normalized;
  });
}

export async function getProductIdBySlug(pathname: string): Promise<{ __typename: 'Product'; entityId: string } | null> {
  const normalized = normalizeHandle(pathname);
  const product = products.find((item) => {
    const p = normalizeHandle(item.handle);
    return p === normalized || p.split('/').pop() === normalized.split('/').pop();
  });
  if (!product) return null;
  return {
    __typename: 'Product',
    entityId: product.handle.split('/').pop() ?? product.id
  };
}

export async function getProductRecommendations(productId: string): Promise<VercelProduct[]> {
  const current = products.find((p) => p.id === productId);
  if (!current) return [];
  return getRelatedProductsForProduct(current, 4);
}

export async function getPage(handle: string): Promise<VercelPage | undefined> {
  return pages.find((page) => normalizeHandle(page.handle) === normalizeHandle(handle));
}

export async function getPages(): Promise<VercelPage[]> {
  return pages;
}

export async function createCart(): Promise<VercelCart> {
  return await getHydratedCart();
}

export async function getCart(_cartId?: string): Promise<VercelCart | undefined> {
  void _cartId;
  return await getHydratedCart();
}

type AddCartLineInput = {
  merchandiseId: string;
  quantity: number;
  productId?: string;
  customization?: LineItemCustomization;
};

type UpdateCartLineInput = {
  id: string;
  merchandiseId: string;
  quantity: number;
  productSlug: string;
};

export async function addToCart(_cartId: string, lines: AddCartLineInput[]): Promise<VercelCart> {
  void _cartId;
  return await appendCartLines(lines);
}

export async function removeFromCart(_cartId: string, lineIds: string[]): Promise<VercelCart | undefined> {
  void _cartId;
  return await removeLinesByIds(lineIds);
}

export async function updateCart(_cartId: string, lines: UpdateCartLineInput[]): Promise<VercelCart> {
  void _cartId;
  for (const l of lines) {
    await updateLineQuantity(l.id, l.quantity);
  }
  return await getHydratedCart();
}

export async function getPageByHandle(handle: string): Promise<VercelPage> {
  const page = await getPage(handle);
  if (!page) notFound();
  return page;
}

export async function revalidate() {
  return { status: 200, body: 'ok' };
}
