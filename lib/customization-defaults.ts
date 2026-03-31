import type { LineItemCustomization, VercelProduct } from './bigcommerce/types';
import { PROFILE_CATALOG } from './placement-profiles';
import { defaultPlacementForProduct } from './placement-presets';
import { previewImageIndexForPlacement } from './preview-image-for-placement';

/**
 * Initial line customization for the artwork flow.
 * When `product` is set, default placement follows the resolved product profile (bag, hat, drinkware, etc.).
 * `previewImages` improves the default gallery index when multiple images exist.
 */
export function createDefaultLineCustomization(
  product?: VercelProduct,
  previewImages?: { altText: string; src: string }[]
): LineItemCustomization {
  if (!product) {
    const p = PROFILE_CATALOG.generic.presets[0]!;
    return {
      noPersonalizationRequested: false,
      placementPreset: p.id,
      placementCenterXPercent: p.x,
      placementCenterYPercent: p.y,
      placementScale: p.defaultScale,
      placementRotationDeg: 0,
      previewImageIndex: 0
    };
  }

  const def = defaultPlacementForProduct(product);
  const idx =
    previewImages && previewImages.length > 0
      ? previewImageIndexForPlacement(def.id, previewImages)
      : 0;

  return {
    noPersonalizationRequested: false,
    placementPreset: def.id,
    placementCenterXPercent: def.x,
    placementCenterYPercent: def.y,
    placementScale: def.defaultScale,
    placementRotationDeg: 0,
    previewImageIndex: idx
  };
}
