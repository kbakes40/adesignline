/** Client-only helpers for “product list” (saved items). */

export type ProductListEntry = {
  id: string;
  handle: string;
  title: string;
};

const STORAGE_KEY = 'adesignline_product_list_v1';

export function readProductList(): ProductListEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is ProductListEntry =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as ProductListEntry).id === 'string' &&
        typeof (x as ProductListEntry).handle === 'string' &&
        typeof (x as ProductListEntry).title === 'string'
    );
  } catch {
    return [];
  }
}

export function writeProductList(entries: ProductListEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 200)));
  } catch {
    /* quota */
  }
}

export function toggleProductList(entry: ProductListEntry): { inList: boolean; list: ProductListEntry[] } {
  const list = readProductList();
  const i = list.findIndex((x) => x.id === entry.id);
  if (i >= 0) {
    list.splice(i, 1);
    writeProductList(list);
    return { inList: false, list };
  }
  list.unshift(entry);
  writeProductList(list);
  return { inList: true, list };
}

export function isInProductList(productId: string): boolean {
  return readProductList().some((x) => x.id === productId);
}
