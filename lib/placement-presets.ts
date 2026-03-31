/**
 * Back-compat barrel: placement zones and profile resolution live in `placement-profiles.ts`.
 */
export type { PlacementPresetDef, PlacementPreviewHint } from './placement-profiles';
export {
  ALL_PRESETS,
  ALL_PRESET_BY_ID,
  defaultPlacementForProduct,
  isBackViewPreset,
  placementPresetsForProduct,
  presetById,
  PROFILE_CATALOG,
  resolveProductPlacementProfile
} from './placement-profiles';

/** @deprecated Use ALL_PRESETS — legacy name for apparel-only era */
export { ALL_PRESETS as PLACEMENT_PRESETS } from './placement-profiles';
