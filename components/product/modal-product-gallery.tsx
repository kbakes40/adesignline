'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { GridTileImage } from 'components/grid/tile';
import { LogoOverlayLayer } from 'components/product/logo-overlay-layer';
import type { LineItemCustomization } from 'lib/bigcommerce/types';
import { isArtworkOverlayPreviewable } from 'lib/artwork-upload';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

export function ModalProductGallery({
  images,
  productTitle,
  customization,
  onCustomizationChange,
  showArtworkOverlay
}: {
  images: { src: string; altText: string }[];
  productTitle: string;
  /** When set, drives gallery index + overlay (quick view customization) */
  customization?: LineItemCustomization | null;
  onCustomizationChange?: (_updates: Partial<LineItemCustomization>) => void;
  showArtworkOverlay?: boolean;
}) {
  const [internalIndex, setInternalIndex] = useState(0);

  const safe = images.filter((i) => i.src);
  const controlledIndex = customization?.previewImageIndex;
  const index =
    typeof controlledIndex === 'number' && controlledIndex >= 0 && controlledIndex < safe.length
      ? controlledIndex
      : internalIndex;

  const setIndex = useCallback(
    (next: number) => {
      if (!safe.length) return;
      const i = (next + safe.length) % safe.length;
      if (onCustomizationChange) {
        onCustomizationChange({ previewImageIndex: i });
      } else {
        setInternalIndex(i);
      }
    },
    [onCustomizationChange, safe.length]
  );

  useEffect(() => {
    setInternalIndex(0);
  }, [images]);

  const current = safe[index] ?? safe[0];
  const hasMultiple = safe.length > 1;

  const go = useCallback(
    (delta: number) => {
      setIndex(index + delta);
    },
    [index, setIndex]
  );

  const artUrl =
    customization &&
    !customization.noPersonalizationRequested &&
    customization.artworkUrl &&
    isArtworkOverlayPreviewable(customization.artworkMimeType, customization.artworkFileName)
      ? customization.artworkUrl
      : null;

  const showOverlay =
    Boolean(showArtworkOverlay && artUrl && onCustomizationChange && customization && !customization.noPersonalizationRequested);

  const xPct = customization?.placementCenterXPercent ?? 50;
  const yPct = customization?.placementCenterYPercent ?? 40;
  const scale = customization?.placementScale ?? 0.5;
  const rotation = customization?.placementRotationDeg ?? 0;

  if (!current?.src) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-neutral-100 text-[13px] text-neutral-500">
        No image available
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        id="quick-view-image-origin"
        className="relative aspect-square w-full bg-neutral-50"
      >
        <div className="absolute inset-0 z-0">
          <Image
            className="object-contain"
            fill
            sizes="(min-width: 1024px) 58vw, (min-width: 768px) 65vw, 100vw"
            quality={92}
            alt={current.altText || productTitle}
            src={current.src}
            priority
          />
        </div>
        {showOverlay && artUrl ? (
          <div className="absolute inset-0 z-10">
            <LogoOverlayLayer
              src={artUrl}
              xPct={xPct}
              yPct={yPct}
              scale={scale}
              rotationDeg={rotation}
              disabled={!onCustomizationChange}
              onPositionChange={(nx, ny) =>
                onCustomizationChange?.({ placementCenterXPercent: nx, placementCenterYPercent: ny })
              }
            />
          </div>
        ) : null}
        {hasMultiple ? (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
            <div className="flex h-10 items-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm backdrop-blur">
              <button
                type="button"
                aria-label="Previous image"
                className="flex h-full items-center px-4 transition hover:text-black"
                onClick={() => go(-1)}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="h-5 w-px bg-neutral-200" />
              <button
                type="button"
                aria-label="Next image"
                className="flex h-full items-center px-4 transition hover:text-black"
                onClick={() => go(1)}
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {hasMultiple ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {safe.map((image, i) => (
            <li key={`${image.src}-${i}`} className="h-16 w-16 shrink-0">
              <button
                type="button"
                aria-label={`View image ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="h-full w-full overflow-hidden rounded-md ring-offset-2 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <GridTileImage
                  alt={image.altText || productTitle}
                  src={image.src}
                  width={64}
                  height={64}
                  quality={85}
                  active={i === index}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
