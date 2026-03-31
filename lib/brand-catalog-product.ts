import type { VercelProduct } from './bigcommerce/types';

function money(amount: number) {
  return { amount: amount.toFixed(2), currencyCode: 'USD' as const };
}

function img(url: string, altText: string) {
  return { url, altText, width: 2400, height: 2400 };
}

function variant(
  id: string,
  title: string,
  amount: number,
  selectedOptions: { name: string; value: string }[] = []
) {
  return {
    id,
    title,
    availableForSale: true,
    selectedOptions,
    price: money(amount)
  };
}

/** Shared builder for ADL-style catalog imports (Carhartt script pattern). */
export function brandCatalogProduct(spec: {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  price: number;
  imageUrl: string;
  supplierSku: string;
  productionDays: number;
  minQuantity: number;
  brandSlug: string;
}): VercelProduct {
  const {
    id,
    handle,
    title,
    description,
    descriptionHtml,
    price,
    imageUrl,
    supplierSku,
    productionDays,
    minQuantity,
    brandSlug
  } = spec;
  const image = img(imageUrl, title);
  const options = [{ id: 'title', name: 'Title', values: ['Default'] }];
  const variants = [variant(`${id}-default`, title, price)];
  return {
    id,
    handle: `/product/${handle}`,
    availableForSale: true,
    title,
    description,
    descriptionHtml,
    options,
    priceRange: { minVariantPrice: money(price), maxVariantPrice: money(price) },
    variants,
    featuredImage: image,
    images: [image],
    seo: { title: title.slice(0, 70), description: description.slice(0, 160) },
    catalog: {
      supplierSku,
      productionDays,
      minQuantity
    },
    tags: [brandSlug, 'brands', 'categories', 'men', 'women'],
    updatedAt: new Date().toISOString()
  };
}
