'use client';

import { DocumentIcon } from '@heroicons/react/24/outline';

export function ArtworkPreview({
  previewUrl,
  mimeType,
  filename,
  alt,
  onImageError
}: {
  previewUrl?: string;
  mimeType: string;
  filename: string;
  alt: string;
  /** Called when signed URL expired or failed to load (e.g. refresh via /api/artwork/sign-url). */
  onImageError?: () => void;
}) {
  const isPdf = mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white/90 p-4 shadow-sm">
        <DocumentIcon className="h-9 w-9 shrink-0 text-neutral-400" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-neutral-900">{filename}</p>
          <p className="mt-0.5 text-[11px] text-neutral-500">PDF — preview available in cart</p>
        </div>
      </div>
    );
  }

  if (!previewUrl) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local blob URLs and same-origin API previews
    <img
      src={previewUrl}
      alt={alt}
      className="max-h-56 w-full rounded-xl border border-neutral-200/80 bg-neutral-50/50 object-contain"
      onError={() => onImageError?.()}
    />
  );
}
