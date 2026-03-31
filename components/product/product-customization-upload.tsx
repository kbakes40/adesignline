'use client';

import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { PlacementControls } from 'components/product/placement-controls';
import type { ArtworkTransparencyMode, LineItemCustomization, VercelProduct } from 'lib/bigcommerce/types';
import {
  artworkAcceptAttribute,
  inferArtworkMimeFromFilename,
  isAllowedArtworkMime,
  maxArtworkBytesClient
} from 'lib/artwork-upload';
import { defaultPlacementForProduct, placementPresetsForProduct } from 'lib/placement-presets';
import { previewImageIndexForPlacement } from 'lib/preview-image-for-placement';
import { resolvePublicProductDetailImageUrl } from 'lib/supabase/storage';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { ArtworkPreview } from './artwork-preview';

function transparencyForMime(mime: string): ArtworkTransparencyMode {
  if (mime === 'image/png' || mime === 'image/svg+xml') return 'native';
  if (mime === 'image/jpeg' || mime === 'image/jpg') return 'opaque';
  if (mime === 'application/pdf') return 'no_auto_bg';
  return 'opaque';
}

function stripArtworkFields(): Partial<LineItemCustomization> {
  return {
    artworkInstructions: undefined,
    artworkFileName: undefined,
    artworkMimeType: undefined,
    artworkStorageKey: undefined,
    artworkStorageBucket: undefined,
    artworkStoragePath: undefined,
    artworkFileSize: undefined,
    artworkSignedUrlExpiresAt: undefined,
    artworkUrl: undefined,
    artworkTransparency: undefined
  };
}

export function ProductCustomizationUpload({
  product,
  customization,
  onCustomizationChange,
  onUploadingChange,
  embedded = false
}: {
  product: VercelProduct;
  customization: LineItemCustomization;
  onCustomizationChange: (_updates: Partial<LineItemCustomization>) => void;
  onUploadingChange?: (_isUploading: boolean) => void;
  embedded?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const previewRefreshAttempts = useRef(0);
  const instructionsId = useId();
  const checkboxId = useId();

  const noPersonalization = customization.noPersonalizationRequested;
  const artwork =
    customization.artworkUrl && (customization.artworkStorageKey || customization.artworkStoragePath)
      ? {
          storageKey: customization.artworkStorageKey ?? customization.artworkStoragePath ?? '',
          url: customization.artworkUrl,
          filename: customization.artworkFileName ?? 'artwork',
          mimeType: customization.artworkMimeType ?? 'application/octet-stream'
        }
      : null;

  const previewImages = useMemo(
    () =>
      product.images?.length
        ? product.images.map((im) => ({
            altText: im.altText,
            src: resolvePublicProductDetailImageUrl(im.url)
          }))
        : product.featuredImage?.url
          ? [
              {
                altText: product.featuredImage.altText,
                src: resolvePublicProductDetailImageUrl(product.featuredImage.url)
              }
            ]
          : [],
    [product]
  );

  const placementPresets = useMemo(() => placementPresetsForProduct(product), [product]);

  useEffect(() => {
    const valid = new Set(placementPresets.map((p) => p.id));
    const cur = customization.placementPreset;
    if (cur && !valid.has(cur)) {
      const def = defaultPlacementForProduct(product);
      onCustomizationChange({
        placementPreset: def.id,
        placementCenterXPercent: def.x,
        placementCenterYPercent: def.y,
        placementScale: def.defaultScale,
        previewImageIndex: previewImageIndexForPlacement(def.id, previewImages)
      });
    }
  }, [placementPresets, customization.placementPreset, previewImages, onCustomizationChange, product]);

  useEffect(() => {
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadError(null);
    setDragOver(false);
  }, [product.id]);

  useEffect(() => {
    return () => {
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  const refreshArtworkSignedPreview = useCallback(async () => {
    const path = customization.artworkStoragePath ?? customization.artworkStorageKey;
    if (!path || path.includes('..')) return;
    if (previewRefreshAttempts.current >= 2) return;
    previewRefreshAttempts.current += 1;
    try {
      const res = await fetch('/api/artwork/sign-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
        credentials: 'same-origin'
      });
      const j = (await res.json()) as { url?: string; expiresAt?: number; error?: string };
      if (!res.ok || !j.url || !j.expiresAt) return;
      previewRefreshAttempts.current = 0;
      onCustomizationChange({
        artworkUrl: j.url,
        artworkSignedUrlExpiresAt: j.expiresAt
      });
    } catch {
      /* ignore */
    }
  }, [customization.artworkStorageKey, customization.artworkStoragePath, onCustomizationChange]);

  useEffect(() => {
    previewRefreshAttempts.current = 0;
  }, [product.id]);

  useEffect(() => {
    const path = customization.artworkStoragePath ?? customization.artworkStorageKey;
    const exp = customization.artworkSignedUrlExpiresAt;
    if (!path || !exp) return;
    if (Date.now() < exp - 3 * 60_000) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/artwork/sign-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path }),
          credentials: 'same-origin'
        });
        const j = (await res.json()) as { url?: string; expiresAt?: number };
        if (!res.ok || cancelled || !j.url || !j.expiresAt) return;
        onCustomizationChange({ artworkUrl: j.url, artworkSignedUrlExpiresAt: j.expiresAt });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    customization.artworkSignedUrlExpiresAt,
    customization.artworkStoragePath,
    customization.artworkStorageKey,
    onCustomizationChange
  ]);

  const clearArtwork = useCallback(() => {
    onCustomizationChange({
      ...stripArtworkFields(),
      placementPreset: customization.placementPreset,
      placementCenterXPercent: customization.placementCenterXPercent,
      placementCenterYPercent: customization.placementCenterYPercent,
      placementScale: customization.placementScale,
      placementRotationDeg: customization.placementRotationDeg
    });
    if (inputRef.current) inputRef.current.value = '';
  }, [customization, onCustomizationChange]);

  const processFile = useCallback(
    async (file: File) => {
      setUploadError(null);
      const maxBytes = maxArtworkBytesClient();
      const clientMime =
        (file.type && file.type.trim()) || inferArtworkMimeFromFilename(file.name) || '';
      if (!clientMime || !isAllowedArtworkMime(clientMime)) {
        setUploadError('Please use PNG, JPG, SVG, or PDF.');
        return;
      }
      if (file.size > maxBytes) {
        setUploadError(`Files must be ${Math.floor(maxBytes / (1024 * 1024))}MB or smaller.`);
        return;
      }

      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });

      const isImage = clientMime.startsWith('image/');
      if (isImage) {
        setLocalPreviewUrl(URL.createObjectURL(file));
      }

      setUploading(true);
      onUploadingChange?.(true);
      try {
        const body = new FormData();
        body.append('file', file);
        const res = await fetch('/api/artwork/upload', { method: 'POST', body, credentials: 'same-origin' });
        const data = (await res.json()) as {
          error?: string;
          storageKey?: string;
          url?: string;
          previewSignedUrl?: string;
          bucket?: string | null;
          path?: string | null;
          filename?: string;
          mimeType?: string;
          fileSize?: number;
          signedUrlExpiresAt?: number | null;
        };
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        if (!data.storageKey || !data.url) {
          throw new Error('Invalid server response');
        }
        setLocalPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        const mime =
          (data.mimeType && data.mimeType.trim()) ||
          (file.type && file.type.trim()) ||
          inferArtworkMimeFromFilename(file.name || data.filename || '') ||
          clientMime;
        const preview = data.previewSignedUrl ?? data.url;
        const storagePath = data.path ?? data.storageKey;
        onCustomizationChange({
          artworkStorageBucket: data.bucket ?? undefined,
          artworkStoragePath: storagePath,
          artworkStorageKey: storagePath,
          artworkUrl: preview,
          artworkFileName: data.filename || file.name,
          artworkMimeType: mime,
          artworkFileSize: data.fileSize,
          artworkSignedUrlExpiresAt: data.signedUrlExpiresAt ?? undefined,
          artworkTransparency: transparencyForMime(mime)
        });
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : 'Upload failed');
        onCustomizationChange(stripArtworkFields());
        setLocalPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } finally {
        setUploading(false);
        onUploadingChange?.(false);
      }
    },
    [onCustomizationChange, onUploadingChange]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = e.relatedTarget as Node | null;
    const root = dropRef.current;
    if (!root) return;
    if (next && root.contains(next)) return;
    setDragOver(false);
  };

  const imagePreviewUrl =
    artwork?.mimeType.startsWith('image/') ? artwork.url : localPreviewUrl || undefined;

  const maxMb = Math.floor(maxArtworkBytesClient() / (1024 * 1024));
  const mime = artwork?.mimeType?.toLowerCase() ?? '';
  const showJpgNote = mime === 'image/jpeg' || mime === 'image/jpg';
  const showPdfNote = mime === 'application/pdf';
  const instructions = customization.artworkInstructions ?? '';

  return (
    <div
      className={clsx(
        embedded ? 'space-y-6' : 'space-y-5 rounded-xl border border-neutral-200/70 bg-white p-5',
        !embedded && 'shadow-sm'
      )}
    >
      {!embedded ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            Custom branding & artwork
          </p>
          <p className="text-[12px] leading-relaxed text-neutral-500">
            Upload your logo or artwork for decoration. We&apos;ll match placement and sizing to the product program.
          </p>
        </div>
      ) : null}

      <div className="space-y-5">
        <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-3 py-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            checked={noPersonalization}
            onChange={(e) => {
              const v = e.target.checked;
              if (v) {
                onCustomizationChange({
                  noPersonalizationRequested: true,
                  ...stripArtworkFields()
                });
              } else {
                onCustomizationChange({
                  noPersonalizationRequested: false
                });
              }
            }}
            className="h-4 w-4 shrink-0 rounded border-neutral-300 bg-white text-black accent-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2"
          />
          <span className="text-[13px] leading-snug text-neutral-700">No personalization required for this line item</span>
        </label>

        <div className={clsx('space-y-4', noPersonalization && 'pointer-events-none opacity-45')}>
          <input
            ref={inputRef}
            type="file"
            accept={artworkAcceptAttribute()}
            className="sr-only"
            aria-label="Upload artwork file"
            onChange={onInputChange}
            disabled={noPersonalization || uploading}
          />

          {!artwork ? (
            <div>
              {localPreviewUrl && uploading ? (
                <div className="mb-4 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={localPreviewUrl}
                    alt=""
                    className="max-h-36 rounded-lg border border-neutral-200/80 object-contain"
                  />
                </div>
              ) : null}
              <div
                ref={dropRef}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={clsx(
                  'flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-5 py-8 text-center transition',
                  'border-neutral-200/90 bg-neutral-50/40',
                  'hover:border-neutral-300/90 hover:bg-neutral-50/70',
                  dragOver && 'border-neutral-400/70 bg-neutral-50 ring-2 ring-black/10',
                  uploading && 'cursor-wait'
                )}
                onClick={() => !uploading && inputRef.current?.click()}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-neutral-400 shadow-sm ring-1 ring-neutral-200/60">
                  <ArrowUpTrayIcon className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-4 text-[13px] font-medium tracking-tight text-neutral-900">
                  {uploading ? 'Uploading…' : 'Drop artwork here or browse'}
                </p>
                <p className="mt-1.5 text-[12px] leading-snug text-neutral-500">
                  Drag a file onto this area, or use the button below.
                </p>
                <div className="mt-4 space-y-0.5 text-center">
                  <p className="text-[11px] text-neutral-400">PNG · JPG · SVG · PDF</p>
                  <p className="text-[11px] text-neutral-400">Up to {maxMb}MB</p>
                </div>
                <button
                  type="button"
                  className="mt-5 w-full max-w-[220px] rounded-full border border-neutral-200/90 bg-white py-2.5 text-[13px] font-medium text-neutral-900 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15 focus-visible:ring-offset-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  disabled={uploading}
                >
                  Browse files
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ArtworkPreview
                previewUrl={imagePreviewUrl}
                mimeType={artwork.mimeType}
                filename={artwork.filename}
                alt="Uploaded artwork"
                onImageError={() => void refreshArtworkSignedPreview()}
              />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <button
                  type="button"
                  className="text-[13px] font-medium text-neutral-700 underline-offset-4 transition hover:text-black hover:underline"
                  onClick={() => {
                    clearArtwork();
                    inputRef.current?.click();
                  }}
                >
                  Replace file
                </button>
                <button
                  type="button"
                  className="text-[13px] font-medium text-red-600/90 underline-offset-4 transition hover:text-red-800 hover:underline"
                  onClick={clearArtwork}
                >
                  Remove
                </button>
              </div>
              {showJpgNote ? (
                <p className="text-[11px] leading-relaxed text-neutral-500">
                  <span className="font-medium text-neutral-700">Tip:</span> For a crisp overlay, use a{' '}
                  <strong>transparent PNG</strong>. JPG keeps a solid background; automatic background removal may be added
                  later.
                </p>
              ) : null}
              {showPdfNote ? (
                <p className="text-[11px] leading-relaxed text-neutral-500">
                  PDF preview isn&apos;t shown on the product image — use PNG or SVG for live placement. We&apos;ll use your
                  PDF for production.
                </p>
              ) : null}
            </div>
          )}

          {uploadError ? (
            <p className="text-[12px] leading-snug text-red-600" role="alert">
              {uploadError}
            </p>
          ) : null}
        </div>
      </div>

      {artwork && !noPersonalization ? (
        <PlacementControls
          presets={placementPresets}
          customization={customization}
          onChange={onCustomizationChange}
          previewImages={previewImages.length ? previewImages : [{ altText: product.title, src: '' }]}
          disabled={noPersonalization}
        />
      ) : null}

      <div className="space-y-2">
        <label htmlFor={instructionsId} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
          Special instructions <span className="font-normal normal-case tracking-normal text-neutral-400">(optional)</span>
        </label>
        <textarea
          id={instructionsId}
          rows={4}
          value={instructions}
          onChange={(e) => onCustomizationChange({ artworkInstructions: e.target.value })}
          placeholder="Placement, PMS colors, size constraints, or file notes…"
          className="w-full resize-y rounded-xl border border-neutral-200/90 bg-white px-3.5 py-3 text-[13px] leading-relaxed text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-black/10"
        />
      </div>
    </div>
  );
}
