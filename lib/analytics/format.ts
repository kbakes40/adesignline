/**
 * Display formatting for analytics — safe with NaN/Infinity and nullish inputs.
 */

export function safeFinite(n: number, fallback = 0): number {
  return Number.isFinite(n) ? n : fallback;
}

/** Large headline KPIs — compact k suffix when ≥ 1,000 */
export function formatKpiUsd(n: number): string {
  const v = safeFinite(n);
  if (v >= 1000) {
    const k = v / 1000;
    if (k % 1 < 0.001) return `${Math.round(k)}k`;
    const s = k.toFixed(2).replace(/\.?0+$/, '').replace(/\.$/, '');
    return `${s}k`;
  }
  return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/** Standard currency for tooltips, tables, labels */
export function formatUsd(n: number, decimals: 0 | 2 = 2): string {
  const v = safeFinite(n);
  return v.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/** Short copy for insights (matches prior compact k behavior) */
export function formatUsdCompactInsight(n: number): string {
  const v = safeFinite(n);
  if (v >= 1000) {
    const k = v / 1000;
    const s = k.toFixed(2).replace(/\.?0+$/, '').replace(/\.$/, '');
    return `${s}k`;
  }
  return v.toFixed(2);
}
