import type { ArtworkPlacementPresetId, VercelProduct } from './bigcommerce/types';
import type { PlacementProfileId } from './placement-types';
import { resolveProductPlacementProfile } from './resolve-product-placement-profile';

export type { PlacementProfileId } from './placement-types';

export type PlacementPreviewHint = 'front' | 'back' | 'sleeve' | 'side';

export type PlacementPresetDef = {
  id: ArtworkPlacementPresetId;
  label: string;
  x: number;
  y: number;
  defaultScale: number;
  view: 'front' | 'back';
  /** Guides gallery image selection when multiple photos exist */
  previewHint?: PlacementPreviewHint;
};

export type ProfileCatalogEntry = {
  defaultPresetId: ArtworkPlacementPresetId;
  presets: PlacementPresetDef[];
};

/** Config-driven placement zones per product family — anchors are % of preview frame */
export const PROFILE_CATALOG: Record<PlacementProfileId, ProfileCatalogEntry> = {
  apparel: {
    defaultPresetId: 'left_chest',
    presets: [
      { id: 'left_chest', label: 'Left chest', x: 38, y: 40, defaultScale: 0.48, view: 'front', previewHint: 'front' },
      { id: 'right_chest', label: 'Right chest', x: 62, y: 40, defaultScale: 0.48, view: 'front', previewHint: 'front' },
      { id: 'center_chest', label: 'Center chest', x: 50, y: 40, defaultScale: 0.52, view: 'front', previewHint: 'front' },
      { id: 'full_front', label: 'Full front', x: 50, y: 48, defaultScale: 0.72, view: 'front', previewHint: 'front' },
      { id: 'upper_back', label: 'Upper back', x: 50, y: 36, defaultScale: 0.5, view: 'back', previewHint: 'back' },
      { id: 'full_back', label: 'Full back', x: 50, y: 48, defaultScale: 0.7, view: 'back', previewHint: 'back' },
      { id: 'left_sleeve', label: 'Left sleeve', x: 18, y: 44, defaultScale: 0.32, view: 'front', previewHint: 'sleeve' },
      { id: 'right_sleeve', label: 'Right sleeve', x: 82, y: 44, defaultScale: 0.32, view: 'front', previewHint: 'sleeve' }
    ]
  },
  backpack: {
    defaultPresetId: 'bp_center_front',
    presets: [
      { id: 'bp_front_pocket', label: 'Front pocket', x: 50, y: 62, defaultScale: 0.42, view: 'front', previewHint: 'front' },
      { id: 'bp_upper_front', label: 'Upper front panel', x: 50, y: 30, defaultScale: 0.45, view: 'front', previewHint: 'front' },
      { id: 'bp_center_front', label: 'Center front', x: 50, y: 46, defaultScale: 0.48, view: 'front', previewHint: 'front' },
      { id: 'bp_top_panel', label: 'Top panel', x: 50, y: 18, defaultScale: 0.38, view: 'front', previewHint: 'front' },
      { id: 'bp_side_panel', label: 'Side panel', x: 24, y: 48, defaultScale: 0.4, view: 'front', previewHint: 'side' }
    ]
  },
  duffel_bag: {
    defaultPresetId: 'df_center_side',
    presets: [
      { id: 'df_center_side', label: 'Center side panel', x: 50, y: 46, defaultScale: 0.46, view: 'front', previewHint: 'side' },
      { id: 'df_left_side', label: 'Left side panel', x: 32, y: 46, defaultScale: 0.44, view: 'front', previewHint: 'side' },
      { id: 'df_right_side', label: 'Right side panel', x: 68, y: 46, defaultScale: 0.44, view: 'front', previewHint: 'side' },
      { id: 'df_end_cap', label: 'End cap', x: 50, y: 50, defaultScale: 0.4, view: 'front', previewHint: 'front' },
      { id: 'df_top_flap', label: 'Top flap', x: 50, y: 26, defaultScale: 0.38, view: 'front', previewHint: 'front' }
    ]
  },
  tote_bag: {
    defaultPresetId: 'tote_center_front',
    presets: [
      { id: 'tote_center_front', label: 'Center front', x: 50, y: 46, defaultScale: 0.5, view: 'front', previewHint: 'front' },
      { id: 'tote_center_back', label: 'Center back', x: 50, y: 46, defaultScale: 0.5, view: 'back', previewHint: 'back' },
      { id: 'tote_upper_front', label: 'Upper front', x: 50, y: 32, defaultScale: 0.44, view: 'front', previewHint: 'front' },
      { id: 'tote_lower_front', label: 'Lower front', x: 50, y: 62, defaultScale: 0.46, view: 'front', previewHint: 'front' }
    ]
  },
  hat: {
    defaultPresetId: 'hat_front_center',
    presets: [
      { id: 'hat_front_center', label: 'Front center', x: 50, y: 44, defaultScale: 0.28, view: 'front', previewHint: 'front' },
      { id: 'hat_left_side', label: 'Left side', x: 28, y: 46, defaultScale: 0.26, view: 'front', previewHint: 'side' },
      { id: 'hat_right_side', label: 'Right side', x: 72, y: 46, defaultScale: 0.26, view: 'front', previewHint: 'side' },
      { id: 'hat_back_arch', label: 'Back arch', x: 50, y: 42, defaultScale: 0.26, view: 'back', previewHint: 'back' }
    ]
  },
  drinkware: {
    defaultPresetId: 'dw_front_logo',
    presets: [
      { id: 'dw_front_logo', label: 'Front logo', x: 50, y: 46, defaultScale: 0.36, view: 'front', previewHint: 'front' },
      { id: 'dw_back_logo', label: 'Back logo', x: 50, y: 46, defaultScale: 0.36, view: 'back', previewHint: 'back' },
      { id: 'dw_center_wrap', label: 'Center wrap', x: 50, y: 50, defaultScale: 0.52, view: 'front', previewHint: 'front' },
      { id: 'dw_opposite_handle', label: 'Opposite handle', x: 32, y: 46, defaultScale: 0.32, view: 'front', previewHint: 'front' }
    ]
  },
  office_item: {
    defaultPresetId: 'off_front_center',
    presets: [
      { id: 'off_front_center', label: 'Front center', x: 50, y: 48, defaultScale: 0.42, view: 'front', previewHint: 'front' },
      { id: 'off_upper_right', label: 'Upper right', x: 72, y: 30, defaultScale: 0.36, view: 'front', previewHint: 'front' },
      { id: 'off_lower_right', label: 'Lower right', x: 72, y: 70, defaultScale: 0.36, view: 'front', previewHint: 'front' },
      { id: 'off_back_center', label: 'Back center', x: 50, y: 48, defaultScale: 0.42, view: 'back', previewHint: 'back' }
    ]
  },
  cooler: {
    defaultPresetId: 'cool_front_pocket',
    presets: [
      { id: 'cool_front_pocket', label: 'Front pocket', x: 50, y: 60, defaultScale: 0.44, view: 'front', previewHint: 'front' },
      { id: 'cool_upper_lid', label: 'Upper lid', x: 50, y: 24, defaultScale: 0.4, view: 'front', previewHint: 'front' },
      { id: 'cool_side_panel', label: 'Side panel', x: 26, y: 48, defaultScale: 0.42, view: 'front', previewHint: 'side' },
      { id: 'cool_center_front', label: 'Center front', x: 50, y: 46, defaultScale: 0.48, view: 'front', previewHint: 'front' }
    ]
  },
  hard_goods: {
    defaultPresetId: 'hg_front_center',
    presets: [
      { id: 'hg_front_center', label: 'Front center', x: 50, y: 50, defaultScale: 0.4, view: 'front', previewHint: 'front' },
      { id: 'hg_upper_center', label: 'Upper center', x: 50, y: 34, defaultScale: 0.36, view: 'front', previewHint: 'front' },
      { id: 'hg_lower_center', label: 'Lower center', x: 50, y: 66, defaultScale: 0.36, view: 'front', previewHint: 'front' }
    ]
  },
  generic: {
    defaultPresetId: 'gen_front_center',
    presets: [{ id: 'gen_front_center', label: 'Front center', x: 50, y: 48, defaultScale: 0.45, view: 'front', previewHint: 'front' }]
  }
};

const _all = (Object.values(PROFILE_CATALOG) as ProfileCatalogEntry[]).flatMap((e) => e.presets);
export const ALL_PRESETS: PlacementPresetDef[] = _all;

export const ALL_PRESET_BY_ID: Record<ArtworkPlacementPresetId, PlacementPresetDef> = _all.reduce(
  (acc, p) => {
    acc[p.id] = p;
    return acc;
  },
  {} as Record<ArtworkPlacementPresetId, PlacementPresetDef>
);

export function presetById(id: ArtworkPlacementPresetId | undefined): PlacementPresetDef | undefined {
  if (!id) return undefined;
  return ALL_PRESET_BY_ID[id];
}

export function isBackViewPreset(id: ArtworkPlacementPresetId | undefined): boolean {
  return presetById(id)?.view === 'back';
}

export function placementPresetsForProduct(product: VercelProduct): PlacementPresetDef[] {
  const profile = resolveProductPlacementProfile(product);
  return PROFILE_CATALOG[profile].presets;
}

/** Default zone + scale for the resolved profile (starting point; user can override). */
export function defaultPlacementForProduct(product: VercelProduct): PlacementPresetDef {
  const profile = resolveProductPlacementProfile(product);
  const entry = PROFILE_CATALOG[profile];
  const def = entry.presets.find((p) => p.id === entry.defaultPresetId) ?? entry.presets[0];
  return def ?? PROFILE_CATALOG.generic.presets[0]!;
}

export { resolveProductPlacementProfile };
