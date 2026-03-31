import { cookies } from 'next/headers';

import { products } from './adesignline-data';
import type { LineItemCustomization, VercelCart, VercelCartItem } from './bigcommerce/types';

type Money = { amount: string; currencyCode: string };

const COOKIE = 'local_cart_v1';

export type StoredCartLine = {
  id: string;
  variantId: string;
  productId: string;
  quantity: number;
  customization?: LineItemCustomization;
};

async function readLines(): Promise<StoredCartLine[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredCartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLines(lines: StoredCartLine[]): Promise<void> {
  let json = JSON.stringify(lines);
  if (json.length > 7500) {
    json = JSON.stringify(lines.slice(-12));
  }
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, json, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
}

function lineTotalAmount(quantity: number, unit: Money): Money {
  const amount = (parseFloat(unit.amount) * quantity).toFixed(2);
  return { amount, currencyCode: unit.currencyCode };
}

function toCartItem(s: StoredCartLine): VercelCartItem | null {
  const product = products.find((p) => p.id === s.productId);
  if (!product) return null;
  const variant = product.variants.find((v) => v.id === s.variantId);
  if (!variant) return null;
  return {
    id: s.id,
    quantity: s.quantity,
    cost: {
      totalAmount: lineTotalAmount(s.quantity, variant.price)
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product
    },
    customization: s.customization
  };
}

export async function getHydratedCart(): Promise<VercelCart> {
  const lines = (await readLines())
    .map(toCartItem)
    .filter((x): x is VercelCartItem => x != null);
  const totalQuantity = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((n, l) => n + parseFloat(l.cost.totalAmount.amount), 0);
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? 'USD';
  const sub = subtotal.toFixed(2);
  return {
    id: 'local-cart',
    checkoutUrl: '/checkout',
    cost: {
      subtotalAmount: { amount: sub, currencyCode },
      totalAmount: { amount: sub, currencyCode },
      totalTaxAmount: { amount: '0.00', currencyCode }
    },
    lines,
    totalQuantity
  };
}

export async function appendCartLines(
  newLines: Array<{
    merchandiseId: string;
    quantity: number;
    productId?: string;
    customization?: LineItemCustomization;
  }>
): Promise<VercelCart> {
  const existing = await readLines();
  for (const line of newLines) {
    const productId = line.productId ?? '';
    const id = crypto.randomUUID();
    existing.push({
      id,
      variantId: line.merchandiseId,
      productId,
      quantity: line.quantity,
      customization: line.customization
    });
  }
  await writeLines(existing);
  return getHydratedCart();
}

export async function removeLinesByIds(lineIds: string[]): Promise<VercelCart | undefined> {
  const filtered = (await readLines()).filter((l) => !lineIds.includes(l.id));
  await writeLines(filtered);
  return getHydratedCart();
}

export async function updateLineQuantity(lineId: string, quantity: number): Promise<VercelCart> {
  const lines = await readLines();
  const idx = lines.findIndex((l) => l.id === lineId);
  if (idx === -1) return getHydratedCart();
  if (quantity <= 0) {
    lines.splice(idx, 1);
  } else {
    const row = lines[idx];
    if (row) {
      row.quantity = Math.max(1, Math.min(999, Math.floor(quantity)));
    }
  }
  await writeLines(lines);
  return getHydratedCart();
}
