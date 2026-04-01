'use client';

import { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatUsd } from 'lib/analytics/format';
import { ChangeIndicator, DashboardCard, MetricValue } from './dashboard-card';
import { AnalyticsChartEmpty } from './chart-empty';
import { adlSectionKicker, adlTooltipShell } from './dashboard-styles';

type Props = {
  profit: number;
  profitChange: number;
  previousProfit: number;
  trend: { date: string; value: number }[];
};

function CustomTooltip(props: Record<string, unknown>) {
  const { active, payload } = props as {
    active?: boolean;
    payload?: { value?: number }[];
  };
  if (!active || !payload?.[0]) return null;
  const v = Number(payload[0].value);
  return (
    <div className={adlTooltipShell}>
      <span className="font-medium tabular-nums text-teal-100/95">${formatUsd(Number.isFinite(v) ? v : 0, 2)}</span>
    </div>
  );
}

export function ProfitTrendCard({ profit, profitChange, previousProfit, trend }: Props) {
  const gid = useId().replace(/:/g, '');
  const gradId = `profitFill-${gid}`;
  const safeTrend = Array.isArray(trend)
    ? trend
        .filter((d) => d && typeof d.date === 'string')
        .map((d) => ({
          date: d.date,
          value: Number.isFinite(Number(d.value)) ? Number(d.value) : 0
        }))
    : [];

  return (
    <DashboardCard
      subtitle={safeTrend.length ? `Last ${safeTrend.length} days` : 'Margin snapshot'}
      className="h-full min-h-[280px] lg:min-h-0"
      padding="compact"
    >
      <div className="flex h-full min-h-0 flex-col justify-between gap-5">
        <div>
          <p className={adlSectionKicker}>Line margin</p>
          <MetricValue value={profit} size="hero" />
          <ChangeIndicator
            change={profitChange}
            label={`vs prior window ($${formatUsd(previousProfit, 2)})`}
          />
        </div>
        {safeTrend.length === 0 ? (
          <AnalyticsChartEmpty title="Margin trend" />
        ) : (
          <div className="h-[4.5rem] min-h-[4rem] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={safeTrend} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5eead4" stopOpacity={0.35} />
                    <stop offset="55%" stopColor="#34d399" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7dd3c0"
                  strokeWidth={1.5}
                  fill={`url(#${gradId})`}
                  dot={false}
                  animationDuration={600}
                  isAnimationActive={safeTrend.length < 60}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
