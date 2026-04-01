'use client';

import { useMemo } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DashboardCard } from './dashboard-card';
import { AnalyticsChartEmpty } from './chart-empty';
import { adlCategoryBarFills, adlTextPrimary, adlTooltipShell } from './dashboard-styles';

type Props = {
  categories: { category: string; quantitySold: number }[];
  dateRangeLabel: string;
};

const axisTick = { fill: 'rgba(167, 212, 200, 0.45)', fontSize: 10, fontWeight: 500 };
const yTick = { fill: 'rgba(200, 230, 218, 0.55)', fontSize: 11, fontWeight: 500 };

function truncateLabel(s: string, max = 14): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function CustomTooltip(props: Record<string, unknown>) {
  const { active, payload, label } = props as {
    active?: boolean;
    payload?: { value?: number }[];
    label?: string;
  };
  if (!active || !payload?.[0]) return null;
  const n = Math.round(Number(payload[0].value));
  return (
    <div className={adlTooltipShell}>
      <p className="mb-0.5 max-w-[12rem] text-[10px] font-medium uppercase tracking-wider text-emerald-200/40">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums text-[#e8f2ee]">
        {(Number.isFinite(n) ? n : 0).toLocaleString('en-US')} units
      </p>
    </div>
  );
}

export function ItemsByCategoryChart({ categories, dateRangeLabel }: Props) {
  const data = useMemo(
    () =>
      (Array.isArray(categories) ? categories : [])
        .filter((c) => c && String(c.category ?? '').trim())
        .map((c) => ({
          category: String(c.category).trim(),
          quantitySold: Number.isFinite(Number(c.quantitySold)) ? Math.max(0, Number(c.quantitySold)) : 0
        })),
    [categories]
  );

  return (
    <DashboardCard subtitle={dateRangeLabel}>
      <h3 className={`mb-5 text-center text-[13px] font-semibold tracking-tight ${adlTextPrimary}`}>
        Catalog mix by category
      </h3>
      {data.length === 0 ? (
        <AnalyticsChartEmpty title="Catalog mix" />
      ) : (
        <div className="h-52 min-h-0 w-full min-w-0 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="category"
                type="category"
                tick={yTick}
                axisLine={false}
                tickLine={false}
                width={104}
                tickFormatter={(v: string) => truncateLabel(String(v))}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,212,191,0.04)' }} />
              <Bar dataKey="quantitySold" radius={[0, 5, 5, 0]} animationDuration={650} barSize={14}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={adlCategoryBarFills[idx % adlCategoryBarFills.length]} fillOpacity={0.88} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  );
}
