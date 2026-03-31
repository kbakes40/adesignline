import { trySupabaseUrl } from 'lib/supabase/env';

/** Supabase Storage bucket names (create as public except artwork-uploads). */
export const STORAGE_BUCKETS = {
  productImages: 'product-images',
  productThumbs: 'product-thumbs',
  brandAssets: 'brand-assets',
  heroBanners: 'hero-banners',
  artworkUploads: 'artwork-uploads'
} as const;

export function publicStorageObjectUrl(bucket: string, path: string): string {
  const base = trySupabaseUrl();
  const clean = normalizeStoragePath(path);
  if (!base) return clean;
  return `${base}/storage/v1/object/public/${bucket}/${clean}`;
}

export function getPublicProductThumbUrl(path: string): string {
  return publicStorageObjectUrl(STORAGE_BUCKETS.productThumbs, path);
}

export function getPublicProductImageUrl(path: string): string {
  return publicStorageObjectUrl(STORAGE_BUCKETS.productImages, path);
}

export function getPublicBrandAssetUrl(path: string): string {
  return publicStorageObjectUrl(STORAGE_BUCKETS.brandAssets, path);
}

export function getPublicHeroBannerUrl(path: string): string {
  return publicStorageObjectUrl(STORAGE_BUCKETS.heroBanners, path);
}

export function isAbsoluteHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

/**
 * Normalize object key: no leading slash, collapse slashes.
 * Strips accidental duplicate bucket prefix if present.
 */
export function normalizeStoragePath(path: string): string {
  let p = path.trim().replace(/^\/+/, '');
  for (const b of Object.values(STORAGE_BUCKETS)) {
    if (p.startsWith(`${b}/`)) p = p.slice(b.length + 1);
  }
  return p.replace(/\/+/g, '/');
}

export type ProductDisplayVariant = 'thumb' | 'full' | 'brand' | 'hero';

/**
 * If value is already an http(s) URL, return as-is (CDN or legacy).
 * Otherwise treat as a path within the bucket implied by `variant`.
 */
export function resolvePublicAssetUrl(
  urlOrPath: string | null | undefined,
  variant: ProductDisplayVariant
): string {
  if (!urlOrPath?.trim()) return '';
  const raw = urlOrPath.trim();
  if (isAbsoluteHttpUrl(raw)) return raw;
  if (!trySupabaseUrl()) return raw;
  let clean = normalizeStoragePath(raw);
  switch (variant) {
    case 'thumb': {
      if (clean.startsWith('thumbs/')) clean = clean.slice('thumbs/'.length);
      return getPublicProductThumbUrl(clean);
    }
    case 'full': {
      if (clean.startsWith('full/')) clean = clean.slice('full/'.length);
      return getPublicProductImageUrl(clean);
    }
    case 'brand':
      return getPublicBrandAssetUrl(clean);
    case 'hero':
      return getPublicHeroBannerUrl(clean);
    default:
      return getPublicProductImageUrl(clean);
  }
}

/** Collection cards — product-thumbs when data is a Storage path. */
export function resolvePublicProductThumbUrl(urlOrPath: string | null | undefined): string {
  return resolvePublicAssetUrl(urlOrPath, 'thumb');
}

/** Modal / PDP — product-images when data is a Storage path. */
export function resolvePublicProductDetailImageUrl(urlOrPath: string | null | undefined): string {
  return resolvePublicAssetUrl(urlOrPath, 'full');
}

/** Legacy helper name — same as publicStorageObjectUrl. */
export function publicStorageUrl(bucket: string, path: string): string {
  return publicStorageObjectUrl(bucket, path);
}

/** Prefer Storage thumb path; fall back to legacy CDN URL. */
export function cardImageUrl(thumbnailStoragePath: string | null | undefined, fallbackUrl: string): string {
  if (thumbnailStoragePath?.trim()) {
    return resolvePublicProductThumbUrl(thumbnailStoragePath);
  }
  return fallbackUrl;
}

/** Modal / zoom — full bucket path or CDN URL from payload. */
export function heroImageUrl(fullStoragePath: string | null | undefined, fallbackUrl: string): string {
  if (fullStoragePath?.trim()) {
    return resolvePublicProductDetailImageUrl(fullStoragePath);
  }
  return fallbackUrl;
}
