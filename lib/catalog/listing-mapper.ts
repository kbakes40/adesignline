import type { ProductListingRow } from 'lib/catalog/product-listing-types';
import type { VercelProduct } from 'lib/bigcommerce/types';
import { resolvePublicProductDetailImageUrl, resolvePublicProductThumbUrl } from 'lib/supabase/storage';

/** Minimal `VercelProduct` for grid cards; modal/PDP replace with full payload. */
export function listingRowToCardProduct(row: ProductListingRow): VercelProduct {
  const minA = row.price_min.toFixed(2);
  const maxA = row.price_max.toFixed(2);
  const thumb = resolvePublicProductThumbUrl(row.thumbnail_url);
  const hero = resolvePublicProductDetailImageUrl(row.hero_url || row.thumbnail_url);
  const w = 900;
  const h = 1125;

  return {
    id: row.id,
    handle: row.handle,
    availableForSale: true,
    title: row.title,
    description: row.short_description ?? '',
    descriptionHtml: '',
    options: [],
    priceRange: {
      minVariantPrice: { amount: minA, currencyCode: row.currency_code },
      maxVariantPrice: { amount: maxA, currencyCode: row.currency_code }
    },
    variants: [
      {
        id: `listing-stub-${row.id}`,
        title: 'Default',
        availableForSale: true,
        selectedOptions: [],
        price: { amount: maxA, currencyCode: row.currency_code }
      }
    ],
    featuredImage: { url: thumb, altText: row.title, width: w, height: h },
    images: [{ url: hero, altText: row.title, width: w, height: h }],
    seo: { title: row.title, description: row.short_description ?? '' },
    tags: row.tags,
    updatedAt: row.updated_at,
    catalog: {
      supplierSku: row.sku ?? undefined,
      minQuantity: row.min_qty ?? undefined
    }
  };
}
