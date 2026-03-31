'use client';

import type { LineItemCustomization } from 'lib/bigcommerce/types';
import type { PlacementPresetDef } from 'lib/placement-presets';
import { isBackViewPreset, presetById } from 'lib/placement-presets';
import { previewImageIndexForPlacement } from 'lib/preview-image-for-placement';
import clsx from 'clsx';
import { useMemo } from 'react';

export function PlacementControls({
  presets,
  customization,
  onChange,
  previewImages,
  disabled
}: {
  presets: PlacementPresetDef[];
  customization: LineItemCustomization;
  onChange: (_updates: Partial<LineItemCustomization>) => void;
  /** Gallery images (alt + src) used to pick front / back / sleeve preview */
  previewImages: { altText: string; src: string }[];
  disabled?: boolean;
}) {
  const imageCount = previewImages.length;

  const validIds = useMemo(() => new Set(presets.map((p) => p.id)), [presets]);
  const presetId = useMemo(() => {
    const raw = customization.placementPreset;
    if (raw && validIds.has(raw)) return raw;
    return presets[0]?.id ?? 'gen_front_center';
  }, [customization.placementPreset, presets, validIds]);

  const scale = customization.placementScale ?? 0.5;
  const rotation = customization.placementRotationDeg ?? 0;
  const presetMeta = presetById(presetId);

  const applyPreset = (id: (typeof presets)[number]['id']) => {
    const def = presetById(id);
    if (!def) return;
    const imgIdx = previewImageIndexForPlacement(id, previewImages);
    onChange({
      placementPreset: id,
      placementCenterXPercent: def.x,
      placementCenterYPercent: def.y,
      placementScale: def.defaultScale,
      previewImageIndex: imgIdx
    });
  };

  const resetPlacement = () => {
    const def = presetById(presetId);
    if (!def) return;
    onChange({
      placementCenterXPercent: def.x,
      placementCenterYPercent: def.y,
      placementScale: def.defaultScale,
      placementRotationDeg: 0,
      previewImageIndex: previewImageIndexForPlacement(presetId, previewImages)
    });
  };

  return (
    <div className={clsx('space-y-4', disabled && 'pointer-events-none opacity-45')}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Placement</p>
        <p className="mt-1 text-[11px] leading-snug text-neutral-400">
          Tap a zone, then drag the logo on the product preview to fine-tune.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={clsx(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition',
                presetId === p.id
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-neutral-200/90 bg-white text-neutral-700 hover:border-neutral-300'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Logo size</label>
          <span className="text-[11px] tabular-nums text-neutral-400">{Math.round(scale * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.18}
          max={1.15}
          step={0.02}
          value={scale}
          onChange={(e) => onChange({ placementScale: parseFloat(e.target.value) })}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-blue-600"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Rotation</label>
          <span className="text-[11px] tabular-nums text-neutral-400">{Math.round(rotation)}°</span>
        </div>
        <input
          type="range"
          min={-45}
          max={45}
          step={1}
          value={rotation}
          onChange={(e) => onChange({ placementRotationDeg: parseFloat(e.target.value) })}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-blue-600"
        />
      </div>

      <button
        type="button"
        onClick={resetPlacement}
        className="text-[12px] font-medium text-neutral-600 underline-offset-4 transition hover:text-black hover:underline"
      >
        Reset placement
      </button>

      {imageCount > 1 && isBackViewPreset(presetId) ? (
        <p className="text-[11px] leading-snug text-neutral-400">
          We switch to the best-matching photo for back decoration (from image labels when available). Use the arrows
          under the main image to change photos if needed.
        </p>
      ) : null}
      {imageCount > 1 && (presetId === 'left_sleeve' || presetId === 'right_sleeve') ? (
        <p className="text-[11px] leading-snug text-neutral-400">
          We pick a side or sleeve-friendly photo when labels match; otherwise the main front view.
        </p>
      ) : null}
      {imageCount > 1 && presetMeta?.previewHint === 'side' ? (
        <p className="text-[11px] leading-snug text-neutral-400">
          We pick a side or profile photo when available; otherwise the main front view.
        </p>
      ) : null}
    </div>
  );
}
