/** Shared validation for artwork uploads (modal + API route). */

export const MAX_ARTWORK_BYTES = 10 * 1024 * 1024;

/** Client-side max (optional NEXT_PUBLIC_MAX_ARTWORK_BYTES). */
export function maxArtworkBytesClient(): number {
  const n = Number(process.env.NEXT_PUBLIC_MAX_ARTWORK_BYTES);
  if (Number.isFinite(n) && n > 0) return Math.min(n, 50 * 1024 * 1024);
  return MAX_ARTWORK_BYTES;
}

/** Server route: prefers MAX_ARTWORK_UPLOAD_BYTES, then public cap, then default. */
export function maxArtworkBytesServer(): number {
  const serverOnly = Number(process.env.MAX_ARTWORK_UPLOAD_BYTES);
  if (Number.isFinite(serverOnly) && serverOnly > 0) return Math.min(serverOnly, 50 * 1024 * 1024);
  const pub = Number(process.env.NEXT_PUBLIC_MAX_ARTWORK_BYTES);
  if (Number.isFinite(pub) && pub > 0) return Math.min(pub, 50 * 1024 * 1024);
  return MAX_ARTWORK_BYTES;
}

const ALLOWED = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
  'application/pdf'
]);

export function isAllowedArtworkMime(mime: string): boolean {
  const m = mime.toLowerCase().trim();
  if (m === 'image/jpg') return true;
  return ALLOWED.has(m);
}

export function artworkAcceptAttribute(): string {
  return '.png,.jpg,.jpeg,.svg,.pdf,image/png,image/jpeg,image/svg+xml,application/pdf';
}

/** When `File.type` is empty (some browsers/OS), infer from extension */
export function inferArtworkMimeFromFilename(filename: string): string | undefined {
  const ext = filename.toLowerCase().split('.').pop();
  if (!ext) return undefined;
  const map: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    webp: 'image/webp'
  };
  return map[ext];
}

/** Whether the overlay preview can show this artwork on the product image */
export function isArtworkOverlayPreviewable(mime: string | undefined, filename?: string): boolean {
  let m = mime?.toLowerCase().trim();
  if (!m && filename) {
    m = inferArtworkMimeFromFilename(filename);
  }
  if (!m) return false;
  if (m === 'image/jpg') return true;
  if (m === 'image/webp') return true;
  return m === 'image/png' || m === 'image/jpeg' || m.startsWith('image/svg');
}
