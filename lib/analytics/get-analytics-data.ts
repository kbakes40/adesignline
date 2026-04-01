/**
 * TABLE → METRIC MAPPING (Supabase)
 *
 * orders
 *   - status: only rows counted when status is in PAID_STATUSES (paid / completed / fulfilled / …)
 *   - total: revenue per order (order header)
 *   - created_at: date bucketing for daily revenue & profit trends, and period filters
 *   - channel: profit/revenue per channel (null → "Direct")
 *
 * order_items
 *   - quantity × unit_price: line revenue (for top sellers, category qty); cross-check with orders.total
 *   - unit_price, unit_cost: line profit = quantity × (unit_price − unit_cost) when unit_cost IS NOT NULL; else 0
 *   - product_id: join to product_listings.id (and optionally public.products.id) for title + category
 *
 * product_listings (existing catalog)
 *   - title: top-selling item name
 *   - category: items-sold-by-category aggregation
 *
 * public.products / public.categories (optional)
 *   - If present, merge step fills title/category for product_ids not found in product_listings.
 *
 * When `orders` / `order_items` are missing or RLS denies access, metrics fall back to empty/zero
 * (no simulated revenue). See supabase/migrations/002_orders_analytics.sql for the expected DDL.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseClientConfigured } from 'lib/supabase/env';
import { getSupabaseServer } from 'lib/supabase/server';
import type {
  AnalyticsDashboardData,
  CategoryBreakdown,
  ChannelBreakdown,
  DailyMetric,
  DateRange,
  TopSellingItem
} from './types';
import { safeFinite } from './format';

const DATE_RANGE_DAYS: Record<Exclude<DateRange, 'ytd'>, number> = {
  last7: 7,
  last30: 30,
  last90: 90
};

/** Order statuses included in revenue / orders / AOV */
const PAID_STATUSES = new Set([
  'paid',
  'completed',
  'complete',
  'fulfilled',
  'shipped',
  'processing',
  'paid_out',
  'closed'
]);

function getDateRangeLabel(range: DateRange): string {
  switch (range) {
    case 'last7':
      return 'Last 7 Days';
    case 'last30':
      return 'Last 30 Days';
    case 'last90':
      return 'Last 90 Days';
    case 'ytd':
      return 'Year to Date';
  }
}

function getDaysInRange(range: DateRange): number {
  if (range === 'ytd') {
    const now = new Date();
    const jan1 = new Date(now.getFullYear(), 0, 1);
    const d = Math.ceil((now.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, d);
  }
  return DATE_RANGE_DAYS[range];
}

function isPaidStatus(status: string): boolean {
  return PAID_STATUSES.has(status.toLowerCase().trim());
}

type RangeBounds = {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
};

function getRangeBounds(dateRange: DateRange): RangeBounds {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const days = getDaysInRange(dateRange);
  const start = new Date(end);
  if (dateRange === 'ytd') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);
  }

  const spanMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  prevEnd.setHours(23, 59, 59, 999);
  const prevStart = new Date(prevEnd.getTime() - spanMs);
  prevStart.setHours(0, 0, 0, 0);

  return { start, end, prevStart, prevEnd };
}

function enumerateDayKeys(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const limit = new Date(end);
  limit.setHours(23, 59, 59, 999);
  while (d <= limit) {
    keys.push(d.toISOString().split('T')[0]!);
    d.setDate(d.getDate() + 1);
  }
  return keys;
}

function isRelationMissing(error: { code?: string; message?: string }): boolean {
  const msg = (error.message ?? '').toLowerCase();
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('could not find the table')
  );
}

type OrderRow = {
  id: string;
  status: string | null;
  total: number | string | null;
  channel: string | null;
  created_at: string;
};

type OrderItemRow = {
  order_id: string;
  product_id: string | null;
  quantity: number | string | null;
  unit_price: number | string | null;
  unit_cost: number | string | null;
};

type PeriodAgg = {
  revenue: number;
  orders: number;
  profit: number;
  revenueByDay: Map<string, number>;
  profitByDay: Map<string, number>;
  channelAgg: Map<string, { revenue: number; orders: number; profit: number }>;
  topByProduct: Map<string, { qty: number; revenue: number }>;
  categoryQty: Map<string, number>;
};

function dayKeyFromIso(iso: string): string {
  if (!iso) return new Date().toISOString().split('T')[0]!;
  return iso.slice(0, 10);
}

function parseNum(v: unknown): number {
  if (v == null) return 0;
  const n = Number(v);
  return safeFinite(n);
}

async function fetchOrdersInRange(
  supabase: SupabaseClient,
  start: Date,
  end: Date
): Promise<{ rows: OrderRow[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('orders')
    .select('id,status,total,channel,created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  if (error) {
    return { rows: [], error: error as Error };
  }
  return { rows: (data ?? []) as OrderRow[], error: null };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function fetchOrderItemsForOrders(
  supabase: SupabaseClient,
  orderIds: string[]
): Promise<{ rows: OrderItemRow[]; error: Error | null }> {
  if (orderIds.length === 0) return { rows: [], error: null };
  const batches = chunk(orderIds, 120);
  const rows: OrderItemRow[] = [];
  for (const batch of batches) {
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id,product_id,quantity,unit_price,unit_cost')
      .in('order_id', batch);
    if (error) {
      return { rows: [], error: error as Error };
    }
    rows.push(...((data ?? []) as OrderItemRow[]));
  }
  return { rows, error: null };
}

async function fetchProductListingsMeta(
  supabase: SupabaseClient,
  productIds: string[]
): Promise<Map<string, { title: string; category: string | null }>> {
  const map = new Map<string, { title: string; category: string | null }>();
  if (productIds.length === 0) return map;
  for (const batch of chunk(productIds, 120)) {
    const { data, error } = await supabase
      .from('product_listings')
      .select('id,title,category')
      .in('id', batch);
    if (error) break;
    for (const r of data ?? []) {
      const id = String((r as { id: string }).id);
      map.set(id, {
        title: String((r as { title?: string }).title ?? '').trim() || 'Product',
        category:
          (r as { category?: string | null }).category != null
            ? String((r as { category: string | null }).category)
            : null
      });
    }
  }
  return map;
}

/** Optional public.products (id, title/name, category) — ignored if table missing */
async function mergeProductsTableMeta(
  supabase: SupabaseClient,
  ids: string[],
  into: Map<string, { title: string; category: string | null }>
): Promise<void> {
  if (ids.length === 0) return;
  const missing = ids.filter((id) => !into.has(id));
  if (missing.length === 0) return;

  for (const batch of chunk(missing, 120)) {
    const { data, error } = await supabase.from('products').select('id,title,name,category').in('id', batch);
    if (error) return;
    for (const r of data ?? []) {
      const row = r as { id: string; title?: string | null; name?: string | null; category?: string | null };
      const title = String(row.title ?? row.name ?? '').trim() || 'Product';
      const cat = row.category != null ? String(row.category) : null;
      into.set(String(row.id), { title, category: cat });
    }
  }
}

function aggregatePeriod(
  paidOrders: OrderRow[],
  items: OrderItemRow[],
  productMeta: Map<string, { title: string; category: string | null }>
): PeriodAgg {
  const orderById = new Map(paidOrders.map((o) => [o.id, o]));
  const revenueByDay = new Map<string, number>();
  const profitByDay = new Map<string, number>();
  const channelAgg = new Map<string, { revenue: number; orders: number; profit: number }>();
  const topByProduct = new Map<string, { qty: number; revenue: number }>();
  const categoryQty = new Map<string, number>();

  let revenue = 0;
  let profit = 0;

  for (const o of paidOrders) {
    const t = parseNum(o.total);
    revenue += t;
    const dk = dayKeyFromIso(o.created_at);
    revenueByDay.set(dk, (revenueByDay.get(dk) ?? 0) + t);

    const ch = (o.channel && o.channel.trim()) || 'Direct';
    const cur = channelAgg.get(ch) ?? { revenue: 0, orders: 0, profit: 0 };
    cur.revenue += t;
    cur.orders += 1;
    channelAgg.set(ch, cur);
  }

  for (const line of items) {
    const o = orderById.get(line.order_id);
    if (!o) continue;

    const qty = Math.max(0, Math.floor(parseNum(line.quantity)));
    const unitPrice = parseNum(line.unit_price);
    const unitCost = line.unit_cost != null && line.unit_cost !== '' ? parseNum(line.unit_cost) : null;
    const lineRev = safeFinite(qty * unitPrice);
    const lineProfit =
      unitCost !== null && Number.isFinite(unitCost) ? safeFinite(qty * (unitPrice - unitCost)) : 0;

    profit += lineProfit;

    const dk = dayKeyFromIso(o.created_at);
    profitByDay.set(dk, (profitByDay.get(dk) ?? 0) + lineProfit);

    const ch = (o.channel && o.channel.trim()) || 'Direct';
    const cg = channelAgg.get(ch);
    if (cg) {
      cg.profit += lineProfit;
      channelAgg.set(ch, cg);
    }

    const pid = line.product_id?.trim();
    if (pid) {
      const tp = topByProduct.get(pid) ?? { qty: 0, revenue: 0 };
      tp.qty += qty;
      tp.revenue += lineRev;
      topByProduct.set(pid, tp);

      const meta = productMeta.get(pid);
      const catRaw = meta?.category?.trim() || 'Uncategorized';
      const cat = formatCategoryName(catRaw);
      categoryQty.set(cat, (categoryQty.get(cat) ?? 0) + qty);
    }
  }

  return {
    revenue: safeFinite(revenue),
    orders: paidOrders.length,
    profit: safeFinite(profit),
    revenueByDay,
    profitByDay,
    channelAgg,
    topByProduct,
    categoryQty
  };
}

function formatCategoryName(raw: string): string {
  return raw
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function trendFromMaps(
  byDay: Map<string, number>,
  rangeStart: Date,
  rangeEnd: Date,
  maxPoints: number
): DailyMetric[] {
  const keys = enumerateDayKeys(rangeStart, rangeEnd);
  const slice = keys.length > maxPoints ? keys.slice(-maxPoints) : keys;
  return slice.map((date) => ({
    date,
    value: safeFinite(byDay.get(date) ?? 0)
  }));
}

function buildTopSelling(
  topByProduct: Map<string, { qty: number; revenue: number }>,
  productMeta: Map<string, { title: string; category: string | null }>
): TopSellingItem[] {
  return Array.from(topByProduct.entries())
    .map(([id, v]) => ({
      name: (() => {
        const t = productMeta.get(id)?.title ?? id;
        return t.length > 48 ? `${t.slice(0, 45)}…` : t;
      })(),
      quantitySold: Math.max(0, Math.floor(v.qty)),
      revenue: safeFinite(v.revenue)
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function buildCategoryBreakdown(categoryQty: Map<string, number>): CategoryBreakdown[] {
  return Array.from(categoryQty.entries())
    .map(([category, quantitySold]) => ({ category, quantitySold: Math.max(0, Math.floor(quantitySold)) }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 7);
}

function buildChannelBreakdown(channelAgg: Map<string, { revenue: number; orders: number; profit: number }>): ChannelBreakdown[] {
  return Array.from(channelAgg.entries())
    .map(([channel, v]) => ({
      channel,
      revenue: Math.round(safeFinite(v.revenue)),
      orders: Math.max(0, Math.floor(v.orders)),
      profit: Math.round(safeFinite(v.profit))
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

async function loadPeriod(
  supabase: SupabaseClient,
  start: Date,
  end: Date
): Promise<{ agg: PeriodAgg; productMeta: Map<string, { title: string; category: string | null }> } | null> {
  const { rows: orderRows, error: oErr } = await fetchOrdersInRange(supabase, start, end);
  if (oErr) {
    if (isRelationMissing(oErr)) return null;
    throw oErr;
  }

  const paidOrders = orderRows.filter((o) => isPaidStatus(String(o.status ?? '')));
  const orderIds = paidOrders.map((o) => o.id);

  const { rows: itemRowsRaw, error: iErr } = await fetchOrderItemsForOrders(supabase, orderIds);
  let itemRows: OrderItemRow[];
  if (iErr) {
    if (isRelationMissing(iErr)) {
      itemRows = [];
    } else {
      throw iErr;
    }
  } else {
    itemRows = itemRowsRaw;
  }

  const productIds = Array.from(
    new Set(itemRows.map((i) => i.product_id).filter(Boolean) as string[])
  );
  const productMeta = await fetchProductListingsMeta(supabase, productIds);
  await mergeProductsTableMeta(supabase, productIds, productMeta);

  return { agg: aggregatePeriod(paidOrders, itemRows, productMeta), productMeta };
}

function emptyTrendForBounds(bounds: RangeBounds, maxPoints = 30): DailyMetric[] {
  const keys = enumerateDayKeys(bounds.start, bounds.end);
  const slice = keys.length > maxPoints ? keys.slice(-maxPoints) : keys;
  return slice.map((date) => ({ date, value: 0 }));
}

function buildEmptyAnalytics(dateRange: DateRange): AnalyticsDashboardData {
  const bounds = getRangeBounds(dateRange);
  const z = emptyTrendForBounds(bounds);
  return {
    profit: 0,
    profitChange: 0,
    previousProfit: 0,
    revenue: 0,
    revenueChange: 0,
    orders: 0,
    averageOrderValue: 0,
    profitTrend: z,
    revenueTrend: z,
    topSellingItems: [],
    channelBreakdown: [],
    categoryBreakdown: [],
    dateRange,
    dateRangeLabel: getDateRangeLabel(dateRange)
  };
}

export async function getAnalyticsData(dateRange: DateRange = 'last30'): Promise<AnalyticsDashboardData> {
  if (!isSupabaseClientConfigured()) {
    return buildEmptyAnalytics(dateRange);
  }

  let supabase: SupabaseClient;
  try {
    supabase = getSupabaseServer();
  } catch {
    return buildEmptyAnalytics(dateRange);
  }

  const bounds = getRangeBounds(dateRange);
  const maxTrendPoints = 30;

  let current: { agg: PeriodAgg; productMeta: Map<string, { title: string; category: string | null }> } | null;
  try {
    current = await loadPeriod(supabase, bounds.start, bounds.end);
  } catch {
    return buildEmptyAnalytics(dateRange);
  }

  if (current === null) {
    return buildEmptyAnalytics(dateRange);
  }

  let previous: { agg: PeriodAgg; productMeta: Map<string, { title: string; category: string | null }> } | null = null;
  try {
    previous = await loadPeriod(supabase, bounds.prevStart, bounds.prevEnd);
  } catch {
    previous = null;
  }

  const prevAgg =
    previous?.agg ?? {
      revenue: 0,
      orders: 0,
      profit: 0,
      revenueByDay: new Map(),
      profitByDay: new Map(),
      channelAgg: new Map(),
      topByProduct: new Map(),
      categoryQty: new Map()
    };

  const cur = current.agg;
  const revenue = safeFinite(cur.revenue);
  const orders = Math.max(0, cur.orders);
  const profit = safeFinite(cur.profit);
  const averageOrderValue =
    orders > 0 ? safeFinite(Math.round((revenue / orders) * 100) / 100) : 0;

  const prevRev = safeFinite(prevAgg.revenue);
  const prevProfit = safeFinite(prevAgg.profit);

  const profitChange =
    prevProfit > 0 ? safeFinite(((profit - prevProfit) / prevProfit) * 100) : profit > 0 ? 100 : 0;
  const revenueChange =
    prevRev > 0 ? safeFinite(((revenue - prevRev) / prevRev) * 100) : revenue > 0 ? 100 : 0;

  const profitTrend = trendFromMaps(cur.profitByDay, bounds.start, bounds.end, maxTrendPoints);
  const revenueTrend = trendFromMaps(cur.revenueByDay, bounds.start, bounds.end, maxTrendPoints);

  const topSellingItems = buildTopSelling(cur.topByProduct, current.productMeta);
  const categoryBreakdown = buildCategoryBreakdown(cur.categoryQty);
  const channelBreakdown = buildChannelBreakdown(cur.channelAgg);

  return {
    profit: safeFinite(profit),
    profitChange: Math.round(safeFinite(profitChange) * 10) / 10,
    previousProfit: safeFinite(prevProfit),
    revenue: safeFinite(revenue),
    revenueChange: Math.round(safeFinite(revenueChange) * 10) / 10,
    orders: Math.max(0, Math.floor(safeFinite(orders))),
    averageOrderValue: safeFinite(averageOrderValue),
    profitTrend,
    revenueTrend,
    topSellingItems,
    channelBreakdown,
    categoryBreakdown,
    dateRange,
    dateRangeLabel: getDateRangeLabel(dateRange)
  };
}
