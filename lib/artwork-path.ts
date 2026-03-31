/** Safe filename segment for Storage keys (no path traversal). */
export function sanitizeArtworkFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() || 'artwork';
  const cleaned = base.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^[._]+/, '').slice(0, 200);
  return cleaned || 'file';
}

/** Validates `guest/{sessionId}/...` paths for signed URL refresh (matches upload layout). */
export function isGuestArtworkPathForSession(path: string, sessionId: string): boolean {
  const p = path.replace(/^\/+/, '');
  if (p.includes('..') || p.includes('//')) return false;
  return p.startsWith(`guest/${sessionId}/`);
}
