/**
 * In-memory artwork storage for local / single-instance dev.
 * Replace with Vercel Blob, S3, or BigCommerce file upload in production.
 * Does not persist across serverless cold starts or multiple instances.
 */

export type ArtworkBlob = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
};

const store = new Map<string, ArtworkBlob>();

export function setArtwork(id: string, data: ArtworkBlob): void {
  store.set(id, data);
}

export function getArtwork(id: string): ArtworkBlob | undefined {
  return store.get(id);
}

export function deleteArtwork(id: string): void {
  store.delete(id);
}
