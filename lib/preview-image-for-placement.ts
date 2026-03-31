import type { ArtworkPlacementPresetId } from './bigcommerce/types';
import { isBackViewPreset, presetById } from './placement-presets';

function imageHaystack(altText: string, src: string): string {
  let path = '';
  try {
    path = new URL(src, 'https://placeholder.local').pathname;
  } catch {
    path = src;
  }
  return `${altText} ${src} ${path}`.toLowerCase();
}

/**
 * Picks the gallery index that best matches the placement (back vs sleeve vs side vs front)
 * using alt text and URL/path keywords. Falls back to sensible defaults when unlabeled.
 */
export function previewImageIndexForPlacement(
  presetId: ArtworkPlacementPresetId | undefined,
  images: { altText: string; src: string }[]
): number {
  if (!images.length) return 0;
  if (images.length === 1) return 0;

  const hint = presetId ? presetById(presetId)?.previewHint : undefined;

  const rows = images.map((im, i) => {
    const s = imageHaystack(im.altText, im.src);
    let back = 0;
    let sleeve = 0;
    let front = 0;
    let side = 0;

    if (/\b(back|rear|reverse|worn back|back view|from behind|flat back|back profile)\b/.test(s)) back += 14;
    if (/\b(shown back|back side|reverse side)\b/.test(s)) back += 10;
    if (/\bview\s*2|second view|image\s*2|alt\s*2|photo\s*2\b/.test(s)) back += 5;
    if (/\b(last|final)\s*(view|image|photo)?\b/.test(s) && i === images.length - 1) back += 3;

    if (/\b(sleeve|long sleeve|short sleeve|sleeves)\b/.test(s)) sleeve += 14;
    if (/\b(side|side view|arm|profile|lateral|three[\s-]?quarter|3[\s/]?4)\b/.test(s)) {
      sleeve += 8;
      side += 12;
    }
    if (/\bangle|angled\b/.test(s)) sleeve += 3;

    if (/\b(front|front view|chest|facing|hero|main|primary)\b/.test(s)) front += 10;
    if (/\bview\s*1|first view|image\s*1|photo\s*1\b/.test(s)) front += 6;

    if (/\b(side profile|side view|edge|panel)\b/.test(s)) side += 10;

    if (/\b(front only|front view only)\b/.test(s)) back -= 10;
    if (/\b(back only)\b/.test(s)) front -= 6;

    return { i, back, sleeve, front, side, s };
  });

  const treatAsBack = presetId && isBackViewPreset(presetId);
  const treatAsSleeve =
    hint === 'sleeve' || presetId === 'left_sleeve' || presetId === 'right_sleeve';
  const treatAsSide = hint === 'side';

  if (treatAsSide) {
    let bestI = 0;
    let best = -Infinity;
    for (const r of rows) {
      const score = r.side + r.sleeve * 0.35 + r.front * 0.2;
      if (score > best) {
        best = score;
        bestI = r.i;
      }
    }
    if (best > 0) return bestI;
    return 0;
  }

  if (treatAsBack) {
    let bestI = 0;
    let best = -Infinity;
    for (const r of rows) {
      if (r.back > best) {
        best = r.back;
        bestI = r.i;
      }
    }
    if (best > 0) return bestI;
    return images.length - 1;
  }

  if (treatAsSleeve) {
    let bestI = 0;
    let best = -Infinity;
    for (const r of rows) {
      const score = r.sleeve + r.front * 0.35;
      if (score > best) {
        best = score;
        bestI = r.i;
      }
    }
    if (best > 0) return bestI;
    return 0;
  }

  let bestI = 0;
  let best = -Infinity;
  for (const r of rows) {
    if (r.front > best) {
      best = r.front;
      bestI = r.i;
    }
  }
  if (best > 0) return bestI;
  return 0;
}
