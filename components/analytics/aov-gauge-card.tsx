'use client';

import { useId } from 'react';
import { safeFinite } from 'lib/analytics/format';
import { DashboardCard, MetricValue } from './dashboard-card';
import { adlSectionKicker } from './dashboard-styles';

type Props = {
  aov: number;
  dateRangeLabel: string;
};

export function AovGaugeCard({ aov, dateRangeLabel }: Props) {
  const gid = useId().replace(/:/g, '');
  const gradId = `aovGauge-${gid}`;

  const maxAov = 100;
  const safeAov = safeFinite(aov);
  const pct = Math.min(100, (safeAov / maxAov) * 100);
  const radius = 50;
  const circumference = Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <DashboardCard subtitle={dateRangeLabel} className="flex-1 justify-center" padding="compact">
      <div className="flex flex-col items-center">
        <p className={`${adlSectionKicker} mb-3 text-center`}>Avg. fulfillment value</p>
        <div className="relative h-[5.5rem] w-28">
          <svg viewBox="0 0 120 72" className="h-full w-full drop-shadow-[0_0_20px_rgba(45,212,191,0.08)]">
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <MetricValue value={safeAov} size="md" />
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
