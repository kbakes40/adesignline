import { navigationGroups } from './adesignline-data';

export type QuickBrowseItem = { label: string; q: string };

function parseQFromPath(path: string): string {
  try {
    const u = new URL(path, 'https://adesignline.local');
    return u.searchParams.get('q')?.replace(/\+/g, ' ') ?? '';
  } catch {
    return '';
  }
}

/** Nav-aligned quick filters (`?q=`) for collection pages — mirrors header dropdowns on the live site. */
export function quickBrowseItemsForCollection(collectionSlug: string): QuickBrowseItem[] {
  switch (collectionSlug) {
    case 'categories':
      return navigationGroups.Categories.map(({ title, path }) => ({
        label: title,
        q: parseQFromPath(path)
      })).filter((x) => x.q.length > 0);
    case 'men':
      return navigationGroups.Men.map(({ title, path }) => ({
        label: title,
        q: parseQFromPath(path)
      })).filter((x) => x.q.length > 0);
    case 'women':
      return navigationGroups.Women.map(({ title, path }) => ({
        label: title,
        q: parseQFromPath(path)
      })).filter((x) => x.q.length > 0);
    case 'promotional-products':
      return navigationGroups['Featured Collections'].map(({ title, path }) => ({
        label: title,
        q: parseQFromPath(path)
      })).filter((x) => x.q.length > 0);
    case 'gift-ideas':
      return [
        { label: 'Gift sets', q: 'gift' },
        { label: 'Drinkware', q: 'drinkware' },
        { label: 'Travel', q: 'travel' },
        { label: 'Premium', q: 'premium' },
        { label: 'Client appreciation', q: 'client' }
      ];
    case 'patches':
      return [
        { label: 'Embroidered', q: 'embroidered' },
        { label: 'Woven', q: 'woven' },
        { label: 'PVC', q: 'pvc' },
        { label: 'Leatherette', q: 'leatherette' },
        { label: 'Dye sublimated', q: 'sublimated' }
      ];
    default:
      return [];
  }
}
