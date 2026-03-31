'use server';

import { addToCart, removeFromCart, updateCart } from 'lib/bigcommerce';
import type { LineItemCustomization } from 'lib/bigcommerce/types';
import { TAGS } from 'lib/constants';
import { updateTag } from 'next/cache';
import { cookies } from 'next/headers';

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function sanitizeCustomization(c: LineItemCustomization): LineItemCustomization {
  const base: LineItemCustomization = {
    noPersonalizationRequested: Boolean(c.noPersonalizationRequested),
    artworkInstructions: c.artworkInstructions?.slice(0, 2000),
    artworkFileName: c.artworkFileName?.slice(0, 255),
    artworkMimeType: c.artworkMimeType?.slice(0, 127),
    artworkStorageKey: c.artworkStorageKey?.slice(0, 512),
    artworkStorageBucket: c.artworkStorageBucket?.slice(0, 64),
    artworkStoragePath: c.artworkStoragePath?.slice(0, 512),
    artworkFileSize:
      c.artworkFileSize != null && Number.isFinite(c.artworkFileSize)
        ? Math.max(0, Math.min(Math.floor(c.artworkFileSize), 52_428_800))
        : undefined,
    artworkSignedUrlExpiresAt:
      c.artworkSignedUrlExpiresAt != null && Number.isFinite(c.artworkSignedUrlExpiresAt)
        ? Math.floor(c.artworkSignedUrlExpiresAt)
        : undefined,
    artworkUrl: c.artworkUrl?.slice(0, 2048)
  };
  if (c.artworkTransparency === 'native' || c.artworkTransparency === 'opaque' || c.artworkTransparency === 'no_auto_bg') {
    base.artworkTransparency = c.artworkTransparency;
  }
  if (c.placementPreset) {
    base.placementPreset = c.placementPreset;
  }
  if (c.placementCenterXPercent != null) {
    base.placementCenterXPercent = clamp(c.placementCenterXPercent, 0, 100);
  }
  if (c.placementCenterYPercent != null) {
    base.placementCenterYPercent = clamp(c.placementCenterYPercent, 0, 100);
  }
  if (c.placementScale != null) {
    base.placementScale = clamp(c.placementScale, 0.05, 2.5);
  }
  if (c.placementRotationDeg != null) {
    base.placementRotationDeg = clamp(c.placementRotationDeg, -180, 180);
  }
  if (c.previewImageIndex != null) {
    base.previewImageIndex = Math.max(0, Math.floor(c.previewImageIndex));
  }
  return base;
}

async function addLinesToCart(
  selectedVariantId: string,
  selectedProductId: string | undefined,
  quantity: number,
  customization?: LineItemCustomization
) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  if (!selectedVariantId) {
    return 'Missing product variant ID' as const;
  }

  const q = Math.max(1, Math.min(999, Math.floor(quantity)));

  try {
    const { id } = await addToCart(cartId ?? '', [
      { merchandiseId: selectedVariantId, quantity: q, productId: selectedProductId, customization }
    ]);
    updateTag(TAGS.cart);
    cookieStore.set('cartId', id);
  } catch (e) {
    return 'Error adding item to cart' as const;
  }
  return null;
}

export async function addItem(
  prevState: any,
  {
    selectedProductId,
    selectedVariantId,
    quantity = 1
  }: {
    selectedProductId: string | undefined;
    selectedVariantId: string | undefined;
    quantity?: number;
  }
) {
  if (!selectedVariantId) {
    return 'Missing product variant ID' as const;
  }
  return addLinesToCart(selectedVariantId, selectedProductId, quantity);
}

/** Quick view / modal form — variant id, product id, quantity, optional customization JSON */
export async function addItemForm(_prevState: unknown, formData: FormData) {
  const selectedVariantId = formData.get('variantId') as string;
  const selectedProductId = (formData.get('productId') as string) || undefined;
  const quantity = Math.max(1, Math.min(999, parseInt(String(formData.get('quantity') ?? '1'), 10) || 1));
  const customizationRaw = formData.get('customization');
  let customization: LineItemCustomization | undefined;
  if (typeof customizationRaw === 'string' && customizationRaw.trim()) {
    try {
      customization = sanitizeCustomization(JSON.parse(customizationRaw) as LineItemCustomization);
    } catch {
      return 'Invalid customization data' as const;
    }
  }
  return addLinesToCart(selectedVariantId, selectedProductId, quantity, customization);
}

export async function removeItem(prevState: any, lineId: string) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  try {
    const response = await removeFromCart(cartId, [lineId]);
    updateTag(TAGS.cart);

    if (!response && cartId) {
      cookieStore.delete('cartId');
    }
  } catch (e) {
    return 'Error removing item from cart';
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    lineId: string;
    productSlug: string;
    variantId: string;
    quantity: number;
  }
) {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  if (!cartId) {
    return 'Missing cart ID';
  }

  const { lineId, productSlug, variantId, quantity } = payload;

  try {
    if (quantity === 0) {
      const response = await removeFromCart(cartId, [lineId]);
      updateTag(TAGS.cart);

      if (!response && cartId) {
        cookieStore.delete('cartId');
      }

      return;
    }

    await updateCart(cartId, [
      {
        id: lineId,
        merchandiseId: variantId,
        quantity,
        productSlug
      }
    ]);
    updateTag(TAGS.cart);
  } catch (e) {
    return 'Error updating item quantity';
  }
}
