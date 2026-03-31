/** Lowercase, trim, unify plus and spaces. */
export function normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/\+/g, ' ').replace(/\s+/g, ' ');
}

/** For fuzzy substring checks: letters and digits only, lowercased. */
export function compactKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Treat hyphens, underscores, spaces as equivalent for matching. */
export function hyphenFold(s: string): string {
  return s.toLowerCase().replace(/[-_\s]+/g, '');
}

const ALIAS_REPLACEMENTS: [RegExp, string][] = [
  [/northface/gi, 'north face'],
  [/underarmour/gi, 'under armour'],
  [/cutterbuck/gi, 'cutter buck'],
  [/fruitoftheloom/gi, 'fruit of the loom'],
  [/tshirt|tee\s*shirt/gi, 't-shirt'],
  [/back\s*pack/gi, 'backpack'],
  [/duffle/gi, 'duffel'],
  [/waterbottle|drinkware/gi, 'drinkware']
];

/** Expand common brand / merch typos and spacing variants before scoring. */
export function expandQueryAliases(raw: string): string {
  let s = normalizeQuery(raw);
  for (const [re, rep] of ALIAS_REPLACEMENTS) {
    s = s.replace(re, rep);
  }
  return s.replace(/\s+/g, ' ').trim();
}

export function tokenize(normalized: string): string[] {
  return normalized.split(/\s+/).filter(Boolean);
}

/** Weak plural → singular for extra token match (bags → bag). */
export function singularLoose(token: string): string {
  if (token.length < 4) return token;
  if (token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.endsWith('ses')) return token.slice(0, -2);
  if (token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}
