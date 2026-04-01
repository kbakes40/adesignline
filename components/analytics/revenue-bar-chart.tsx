'use client';

import { useId, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatUsd } from 'lib/analytics/format';
import { DashboardCard, MetricValue } from './dashboard-card';
import { AnalyticsChartEmpty } from './chart-empty';
import { adlSectionKicker, adlTooltipShell } from './dashboard-styles';

type Props = {
  revenue: number;
  trend: { date: string; value: number }[];
  dateRangeLabel: string;
};

const axisTick = { fill: 'rgba(167, 212, 200, 0.42)', fontSize: 10, fontWeight: 500 };

function parseChartDate(d: string): Date {
  const x = new Date(d.includes('T') ? d : `${d}T12:00:00`);
  return Number.isNaN(x.getTime()) ? new Date() : x;
}

function CustomTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as {
    active?: boolean;
    payload?: { value?: number }[];
    label?: string;
  };
  if (!active || !payload?.[0]) return null;
  const v = Number(payload[0].value);
  return (
    <div className={adlTooltipShell}>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-emerald-200/40">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-[#e8f2ee]">
        ${formatUsd(Number.isFinite(v) ? v : 0, 2)}
      </p>
    </div>
  );
}

export function RevenueBarChart({ revenue, trend, dateRangeLabel }: Props) {
  const gid = useId().replace(/:/g, '');
  const barGrad = `revBar-${gid}`;

  const displayData = useMemo(() => {
    const rows = Array.isArray(trend) ? trend : [];
    return rows.map((d) => ({
      ...d,
      value: Number.isFinite(Number(d.value)) ? Number(d.value) : 0,
      label: parseChartDate(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [trend]);

  const tickCount = displayData.length;
  const xInterval =
    tickCount <= 8 ? 0 : tickCount <= 16 ? Math.max(0, Math.floor(tickCount / 6)) : Math.max(0, Math.floor(tickCount / 7));

  const maxVal = displayData.reduce((m, d) => Math.max(m, d.value), 0);

  return (
    <DashboardCard subtitle={dateRangeLabel} variant="hero" className="min-h-[380px] lg:min-h-[420px]">
      <div className="mb-6 text-center">
        <p className={adlSectionKicker}>Throughput value</p>
        <MetricValue value={revenue} size="hero" />
      </div>
      {displayData.length === 0 ? (
        <AnalyticsChartEmpty title="Throughput value" />
      ) : (
        <div className="h-56 min-h-0 w-full min-w-0 sm:h-60 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                interval={xInterval}
                height={28}
              />
              <YAxis
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${v}`}
                width={48}
                domain={[0, maxVal > 0 ? Math.ceil(maxVal * 1.08) : 1]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,212,191,0.04)' }} />
              <Bar
                dataKey="value"
                fill={`url(#${barGrad})`}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                animationDuration={700}
                isAnimationActive={displayData.length < 90}
              />
              <defs>
                <linearGradient id={barGrad} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3c0" stopOpacity={0.95} />
                  <stop offset="45%" stopColor="#2dd4bf" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity={0.75} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}
