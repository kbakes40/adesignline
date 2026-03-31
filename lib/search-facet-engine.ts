import type { VercelProduct } from 'lib/bigcommerce/types';
import { SEARCH_MULTI_FACET_GROUPS, type FacetMultiGroup } from 'lib/search-facet-data';

export type FacetFilterState = {
  priceMax?: number;
  productionDaysMax?: number;
  minQtyMax?: number;
  /** Multi-select: facet id -> selected value slugs (OR within group) */
  multi: Partial<Record<string, string[]>>;
};

const EMPTY_STATE: FacetFilterState = { multi: {} };

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ');
}

export function productHaystack(p: VercelProduct): string {
  return [p.title, p.description, stripHtml(p.descriptionHtml), ...p.tags].join(' ').toLowerCase();
}

/** Parse dimensions like 24" x 14" x 3" or 24 x 14 x 3 IN */
function parseDimensionsFromText(text: string): { w?: number; l?: number; h?: number } {
  const t = text.toLowerCase();
  const nums = Array.from(t.matchAll(/(\d+(?:\.\d+)?)\s*(?:"|in|inch)?/gi)).map((m) => parseFloat(m[1]!));
  if (nums.length >= 3) return { w: nums[0], l: nums[1], h: nums[2] };
  return {};
}

export function inferFacetNumbers(p: VercelProduct): {
  price: number;
  productionDays?: number;
  minQty?: number;
  widthIn?: number;
  lengthIn?: number;
  heightIn?: number;
} {
  const price = Number.parseFloat(p.priceRange.minVariantPrice.amount);
  const c = p.catalog;
  const prod = c?.productionDays;
  const mq = c?.minQuantity;
  let widthIn: number | undefined;
  let lengthIn: number | undefined;
  let heightIn: number | undefined;
  if (c?.dimensionsDisplay) {
    const d = parseDimensionsFromText(c.dimensionsDisplay);
    widthIn = d.w;
    lengthIn = d.l;
    heightIn = d.h;
  }
  const fb = c?.featureBullets?.join(' ') ?? '';
  if (!widthIn && fb) {
    const d = parseDimensionsFromText(fb);
    widthIn = d.w;
    lengthIn = d.l;
    heightIn = d.h;
  }
  return {
    price: Number.isFinite(price) ? price : 0,
    productionDays: typeof prod === 'number' ? prod : undefined,
    minQty: typeof mq === 'number' ? mq : undefined,
    widthIn,
    lengthIn,
    heightIn
  };
}

function normSize(s: string): string | undefined {
  const u = s.trim().toUpperCase().replace(/\s+/g, '');
  const map: Record<string, string> = {
    XS: 'xs',
    S: 's',
    M: 'm',
    L: 'l',
    XL: 'xl',
    '2XL': '2xl',
    '3XL': '3xl',
    '4XL': '4xl',
    '5XL': '5xl',
    OSFA: 'osfa',
    'ONE SIZE': 'osfa'
  };
  return map[u] ?? map[u.replace(/\s/g, '')];
}

/** Inferred facet value slugs for multi-select filters. */
export function inferFacetMulti(p: VercelProduct): Record<string, string[]> {
  const h = productHaystack(p);
  const tags = p.tags.map((t) => t.toLowerCase());
  const out: Record<string, Set<string>> = {};

  const add = (id: string, value: string) => {
    if (!out[id]) out[id] = new Set();
    out[id]!.add(value);
  };

  for (const g of SEARCH_MULTI_FACET_GROUPS) {
    const { id } = g;
    if (id === 'brand') {
      if (h.includes('carhartt') || tags.some((t) => t.includes('carhartt'))) add(id, 'carhartt');
      if (h.includes('augusta')) add(id, 'augusta-sportswear');
      if (h.includes('holloway')) add(id, 'holloway');
      if (h.includes('outdoor cap') || h.includes('outdoor-cap')) add(id, 'outdoor-cap');
      if (h.includes('pacific headwear')) add(id, 'pacific-headwear');
      if (h.includes('port & company') || h.includes('port and company')) add(id, 'port-company');
      if (h.includes('port authority')) add(id, 'port-authority');
      if (h.includes('russell athletic')) add(id, 'russell-athletic');
      if (h.includes('sport-tek') || h.includes('sport tek')) add(id, 'sport-tek');
      if (h.includes('stormtech')) add(id, 'stormtech');
      continue;
    }
    if (id === 'apparel_size') {
      for (const v of p.variants) {
        for (const so of v.selectedOptions) {
          if (so.name.toLowerCase().includes('size')) {
            const n = normSize(so.value);
            if (n) add(id, n);
          }
        }
      }
      continue;
    }
    if (id === 'gender') {
      if (tags.includes('men')) add(id, 'mens');
      if (tags.includes('women')) add(id, 'womens');
      if (h.includes("women's") || h.includes('womens')) add(id, 'womens');
      if (h.includes("men's") || h.includes('mens ')) add(id, 'mens');
      if (!out[id]) add(id, 'unisex');
      continue;
    }
    if (id === 'color_family') {
      const colors: [string, string][] = [
        ['black', 'black'],
        ['navy', 'blue'],
        ['blue', 'blue'],
        ['brown', 'brown'],
        ['gray', 'gray'],
        ['grey', 'gray'],
        ['green', 'green'],
        ['orange', 'orange'],
        ['purple', 'purple'],
        ['red', 'red'],
        ['white', 'white'],
        ['multicolor', 'multicolor'],
        ['multi-color', 'multicolor']
      ];
      for (const [kw, slug] of colors) {
        if (h.includes(kw)) add(id, slug);
      }
      continue;
    }
    if (id === 'decoration_method') {
      if (h.includes('embroider')) add(id, 'embroidery');
      if (h.includes('screen print') || h.includes('screenprint')) add(id, 'screenprint');
      if (h.includes('heat transfer')) add(id, 'heat-transfer');
      if (h.includes('laser') && h.includes('etch')) add(id, 'laser-etch');
      if (h.includes('sublimation') || h.includes('sublimat')) add(id, 'sublimation');
      if (h.includes('dye sub')) add(id, 'dye-sublimation');
      if (h.includes('vinyl')) add(id, 'vinyl-transfer');
      if (h.includes('full color')) add(id, 'full-color');
      continue;
    }
    if (id === 'material') {
      if (/\bcotton\b/.test(h)) add(id, 'cotton');
      if (h.includes('polyester')) add(id, 'polyester');
      if (h.includes('fleece')) add(id, 'polyester-fleece');
      if (h.includes('nylon')) add(id, 'nylon-water-repellant');
      if (h.includes('acrylic')) add(id, 'acrylic');
      continue;
    }
    if (id === 'sleeve_length') {
      if (h.includes('long sleeve') || h.includes('long-sleeve')) add(id, 'long-sleeve');
      if (h.includes('short sleeve') || h.includes('short-sleeve')) add(id, 'short-sleeve');
      if (h.includes('3/4')) add(id, '3-4-sleeve');
      continue;
    }
    if (id === 'neckline') {
      if (h.includes('hood')) add(id, 'hooded');
      if (h.includes('crew')) add(id, 'crewneck');
      if (h.includes('v-neck') || h.includes('v neck')) add(id, 'v-neck');
      if (h.includes('cadet')) add(id, 'cadet-collar');
      if (h.includes('rib collar') || h.includes('rib-collar')) add(id, 'rib-collar');
      continue;
    }
    if (id === 'zipper_type') {
      if (h.includes('quarter zip') || h.includes('1/4 zip') || h.includes('1/4-zip')) add(id, 'quarter-zip');
      if (h.includes('half zip') || h.includes('half-zip')) add(id, 'half-zip');
      if (h.includes('full zip') || h.includes('full-zip') || h.includes('zip up')) add(id, 'zip-up');
      continue;
    }
    if (id === 'eco_friendly') {
      if (h.includes('eco') || h.includes('recycled') || h.includes('sustainable')) add(id, 'eco-friendly');
      continue;
    }
    if (id === 'durability') {
      if (h.includes('machine wash')) add(id, 'machine-washable');
      if (h.includes('water resistant') || h.includes('water-resistant')) add(id, 'water-resistant');
      continue;
    }
    if (id === 'moisture_wicking') {
      if (h.includes('moisture') || h.includes('dri-fit') || h.includes('dri fit')) add(id, 'moisture-wicking');
      continue;
    }
    if (id === 'made_in_usa') {
      if (h.includes('made in usa') || h.includes('made in u.s.a')) add(id, 'made-in-usa');
      continue;
    }
    if (id === 'theme') {
      if (h.includes('golf')) add(id, 'golf');
      if (h.includes('health')) add(id, 'health-care');
      if (h.includes('hotel')) add(id, 'hotel-resort-theme');
      if (h.includes('construction')) add(id, 'construction');
      if (h.includes('financial')) add(id, 'financial-services');
      if (h.includes('sustainable')) add(id, 'sustainable');
      continue;
    }
    if (id === 'industry') {
      if (h.includes('golf')) add(id, 'sports');
      if (h.includes('health')) add(id, 'healthcare');
      if (h.includes('hotel')) add(id, 'hotel-resort');
      if (h.includes('college') || h.includes('university')) add(id, 'collegiate');
      if (h.includes('restaurant') || h.includes('dining')) add(id, 'restaurant');
      continue;
    }
    if (id === 'width_in' || id === 'length_in' || id === 'height_in') {
      const nums = inferFacetNumbers(p);
      const dim = id === 'width_in' ? nums.widthIn : id === 'length_in' ? nums.lengthIn : nums.heightIn;
      if (dim != null) {
        const key = String(dim);
        const allowed = g.options.some((o) => o.value === key);
        if (allowed) add(id, key);
      }
      continue;
    }
  }

  for (const g of SEARCH_MULTI_FACET_GROUPS) {
    if (out[g.id]?.size) continue;
    for (const opt of g.options) {
      const needle = opt.label.toLowerCase();
      if (needle.length >= 4 && h.includes(needle)) add(g.id, opt.value);
    }
  }

  const result: Record<string, string[]> = {};
  for (const [k, set] of Object.entries(out)) {
    result[k] = Array.from(set);
  }
  return result;
}

function productMatchesMulti(
  p: VercelProduct,
  multi: Partial<Record<string, string[]>>,
  cache: Map<string, Record<string, string[]>>
): boolean {
  if (!multi || Object.keys(multi).length === 0) return true;
  let inferred = cache.get(p.id);
  if (!inferred) {
    inferred = inferFacetMulti(p);
    cache.set(p.id, inferred);
  }
  for (const [groupId, selected] of Object.entries(multi)) {
    if (!selected?.length) continue;
    const productVals = new Set(inferred[groupId] ?? []);
    const hit = selected.some((s) => productVals.has(s));
    if (!hit) return false;
  }
  return true;
}

function productMatchesRanges(
  p: VercelProduct,
  state: FacetFilterState,
  cache: Map<string, ReturnType<typeof inferFacetNumbers>>
): boolean {
  let nums = cache.get(p.id);
  if (!nums) {
    nums = inferFacetNumbers(p);
    cache.set(p.id, nums);
  }
  if (state.priceMax != null && Number.isFinite(state.priceMax) && nums.price > state.priceMax) return false;
  if (state.productionDaysMax != null && Number.isFinite(state.productionDaysMax)) {
    if (nums.productionDays != null && nums.productionDays > state.productionDaysMax) return false;
  }
  if (state.minQtyMax != null && Number.isFinite(state.minQtyMax)) {
    if (nums.minQty != null && nums.minQty > state.minQtyMax) return false;
  }
  return true;
}

export function applyFacetFilters(products: VercelProduct[], state: FacetFilterState | undefined): VercelProduct[] {
  if (!state || isEmptyFacetState(state)) return products;
  const numCache = new Map<string, ReturnType<typeof inferFacetNumbers>>();
  const multiCache = new Map<string, Record<string, string[]>>();
  return products.filter(
    (p) => productMatchesRanges(p, state, numCache) && productMatchesMulti(p, state.multi, multiCache)
  );
}

export function isEmptyFacetState(state: FacetFilterState): boolean {
  if (state.priceMax != null && state.priceMax > 0) return false;
  if (state.productionDaysMax != null && state.productionDaysMax > 0) return false;
  if (state.minQtyMax != null && state.minQtyMax > 0) return false;
  if (!state.multi) return true;
  return Object.values(state.multi).every((v) => !v?.length);
}

export function parseFacetFilterState(searchParams: Record<string, string | string[] | undefined>): FacetFilterState {
  const state: FacetFilterState = { multi: {} };
  const get = (k: string): string | undefined => {
    const v = searchParams[k];
    if (Array.isArray(v)) return v[0];
    return typeof v === 'string' ? v : undefined;
  };
  const parseNum = (k: string): number | undefined => {
    const s = get(k);
    if (s == null || s === '') return undefined;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : undefined;
  };
  state.priceMax = parseNum('pmax');
  state.productionDaysMax = parseNum('dmax');
  state.minQtyMax = parseNum('mqmax');

  for (const g of SEARCH_MULTI_FACET_GROUPS) {
    const key = `f_${g.id}`;
    const raw = get(key);
    if (!raw?.trim()) continue;
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) state.multi[g.id] = parts;
  }
  if (isEmptyFacetState(state)) return { ...EMPTY_STATE };
  return state;
}

export function serializeFacetFacetParams(
  state: FacetFilterState,
  base: { sort?: string; q?: string },
  /** e.g. `category` (merch bucket) on `/search/[collection]` */
  preserve?: Record<string, string | undefined>
): URLSearchParams {
  const p = new URLSearchParams();
  if (base.sort) p.set('sort', base.sort);
  if (base.q?.trim()) p.set('q', base.q.trim().replace(/\s+/g, '+'));
  if (preserve) {
    for (const [k, v] of Object.entries(preserve)) {
      if (v) p.set(k, v);
    }
  }
  if (state.priceMax != null && state.priceMax > 0) p.set('pmax', String(state.priceMax));
  if (state.productionDaysMax != null && state.productionDaysMax > 0) p.set('dmax', String(state.productionDaysMax));
  if (state.minQtyMax != null && state.minQtyMax > 0) p.set('mqmax', String(state.minQtyMax));
  for (const [id, vals] of Object.entries(state.multi)) {
    if (vals?.length) p.set(`f_${id}`, vals.join(','));
  }
  return p;
}

export function facetToggleHref(
  state: FacetFilterState,
  groupId: string,
  value: string,
  base: { sort?: string; q?: string },
  preserve?: Record<string, string | undefined>
): string {
  const cur = new Set(state.multi[groupId] ?? []);
  if (cur.has(value)) cur.delete(value);
  else cur.add(value);
  const multi = { ...state.multi };
  if (cur.size) multi[groupId] = Array.from(cur);
  else delete multi[groupId];
  const qs = serializeFacetFacetParams({ ...state, multi }, base, preserve);
  return `?${qs.toString()}`;
}

export function clearFacetsHref(
  base: { sort?: string; q?: string },
  preserve?: Record<string, string | undefined>
): string {
  const qs = serializeFacetFacetParams({ multi: {} }, base, preserve);
  return `?${qs.toString()}`;
}

export function rangeFacetHref(
  state: FacetFilterState,
  patch: Partial<Pick<FacetFilterState, 'priceMax' | 'productionDaysMax' | 'minQtyMax'>>,
  base: { sort?: string; q?: string },
  preserve?: Record<string, string | undefined>
): string {
  const next = { ...state, ...patch };
  const qs = serializeFacetFacetParams(next, base, preserve);
  return `?${qs.toString()}`;
}

/** Flat key/value for pagination and forms (omit empty). */
export function facetStateToFlatRecord(
  state: FacetFilterState,
  preserve?: Record<string, string | undefined>
): Record<string, string> {
  const o: Record<string, string> = {};
  if (preserve) {
    for (const [k, v] of Object.entries(preserve)) {
      if (v) o[k] = v;
    }
  }
  if (state.priceMax != null && state.priceMax > 0) o.pmax = String(state.priceMax);
  if (state.productionDaysMax != null && state.productionDaysMax > 0) o.dmax = String(state.productionDaysMax);
  if (state.minQtyMax != null && state.minQtyMax > 0) o.mqmax = String(state.minQtyMax);
  for (const [id, vals] of Object.entries(state.multi)) {
    if (vals?.length) o[`f_${id}`] = vals.join(',');
  }
  return o;
}

export function countForFacetOption(
  group: FacetMultiGroup,
  optionValue: string,
  basePool: VercelProduct[],
  state: FacetFilterState
): number {
  const multi = { ...state.multi };
  delete multi[group.id];
  const stateWithoutGroup: FacetFilterState = { ...state, multi };
  const pool = applyFacetFilters(basePool, isEmptyFacetState(stateWithoutGroup) ? undefined : stateWithoutGroup);
  let n = 0;
  for (const p of pool) {
    const inf = inferFacetMulti(p);
    if ((inf[group.id] ?? []).includes(optionValue)) n++;
  }
  return n;
}

/** Per-option counts with other facet groups applied (standard faceted search). */
export function computeFacetCountMap(
  basePool: VercelProduct[],
  state: FacetFilterState
): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const g of SEARCH_MULTI_FACET_GROUPS) {
    const multi = { ...state.multi };
    delete multi[g.id];
    const stateWithoutGroup: FacetFilterState = { ...state, multi };
    const pool = applyFacetFilters(basePool, isEmptyFacetState(stateWithoutGroup) ? undefined : stateWithoutGroup);
    const row: Record<string, number> = {};
    for (const opt of g.options) row[opt.value] = 0;
    for (const p of pool) {
      const inf = inferFacetMulti(p);
      for (const v of inf[g.id] ?? []) {
        if (row[v] !== undefined) row[v]++;
      }
    }
    out[g.id] = row;
  }
  return out;
}

