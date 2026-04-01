import type { AnalyticsDashboardData } from './types';
import { formatUsdCompactInsight, safeFinite } from './format';

export function generateInsightsSummary(data: AnalyticsDashboardData): string {
  const {
    dateRangeLabel,
    profit,
    profitChange,
    revenue,
    revenueChange,
    orders,
    topSellingItems,
    categoryBreakdown
  } = data;

  const pc = safeFinite(profitChange);
  const rc = safeFinite(revenueChange);

  const marginDirection = pc >= 0 ? 'improved' : 'tightened';
  const throughputDirection = rc >= 0 ? 'increased' : 'decreased';

  const topCategories = categoryBreakdown
    .filter((c) => c.category?.trim())
    .slice(0, 2)
    .map((c) => c.category)
    .join(' and ');

  const topProduct = topSellingItems[0]?.name?.trim() || 'your highest-velocity SKUs';

  const parts: string[] = [];

  parts.push(
    `In the ${dateRangeLabel.toLowerCase()}, line-level margin landed at $${formatUsdCompactInsight(profit)}, ` +
      `${marginDirection} ${Math.abs(pc).toFixed(1)}% versus the prior window, ` +
      `indicating ${pc >= 0 ? 'healthier margin on fulfilled catalog' : 'margin pressure worth reviewing at the SKU level'}.`
  );

  parts.push(
    `Catalog throughput value ${throughputDirection} to $${formatUsdCompactInsight(revenue)} ` +
      `(${rc >= 0 ? '+' : '−'}${Math.abs(rc).toFixed(1)}%), ` +
      `across ${Math.max(0, orders)} fulfillments.`
  );

  if (topCategories) {
    parts.push(
      `Catalog mix is most concentrated in ${topCategories}, ` +
        `with the strongest velocity from ${topProduct}.`
    );
  }

  if (pc >= 5) {
    parts.push('Margin momentum looks healthy — prioritize replenishment for high-velocity SKUs.');
  } else if (pc < -5) {
    parts.push('Review margin drivers and slow-moving SKUs to restore catalog readiness.');
  }

  return parts.join(' ');
}
