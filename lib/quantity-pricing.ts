import type { VercelProductCatalog } from './bigcommerce/types';

export type QuantityPriceTier = { quantity: number; unitPrice: number };

/** Tier minimum quantities are ascending; price applies when order qty meets that break. */
export function unitPriceForQuantity(qty: number, tiers: QuantityPriceTier[]): number | undefined {
  if (!tiers.length || qty < 1) return undefined;
  const sorted = [...tiers].sort((a, b) => b.quantity - a.quantity);
  const tier = sorted.find((t) => qty >= t.quantity);
  return tier?.unitPrice ?? sorted[sorted.length - 1]?.unitPrice;
}

export function catalogHasQuantityPricing(c: VercelProductCatalog | undefined): c is VercelProductCatalog & {
  quantityPrices: QuantityPriceTier[];
} {
  return !!c?.quantityPrices && c.quantityPrices.length > 0;
}

const DEFAULT_MAX_ORDER_QTY = 999;
/** Supplier patch tiers often go to 5k–10k+; keep headroom for large programs. */
const PATCH_MAX_ORDER_QTY = 100_000;

/** Quick view / cart UI cap — higher for patches than general promo SKUs. */
export function maxOrderQuantityForProduct(product: {
  tags?: string[];
  catalog?: { quantityPrices?: { quantity: number }[] };
}): number {
  if (product.catalog?.quantityPrices?.length) return PATCH_MAX_ORDER_QTY;
  if (product.tags?.includes('patches')) return PATCH_MAX_ORDER_QTY;
  return DEFAULT_MAX_ORDER_QTY;
}
