import type { ArtworkPlacementPresetId } from './bigcommerce/types';
import { presetById } from './placement-profiles';

/** Human label for cart / admin when showing preset id */
export function labelForPlacementPreset(id: ArtworkPlacementPresetId | undefined): string {
  if (!id) return '';
  return presetById(id)?.label ?? id.replace(/_/g, ' ');
}
