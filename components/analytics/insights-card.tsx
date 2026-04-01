'use client';

import { DashboardCard } from './dashboard-card';
import { adlTextPrimary } from './dashboard-styles';

type Props = {
  summary: string;
  dateRangeLabel: string;
};

function hasPositiveSignal(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes('increased') ||
    t.includes('improved') ||
    t.includes('healthy') ||
    t.includes('positive') ||
    t.includes('momentum') ||
    t.includes('stronger') ||
    t.includes('significant positive')
  );
}

export function InsightsCard({ summary, dateRangeLabel }: Props) {
  const positive = hasPositiveSignal(summary);

  return (
    <DashboardCard subtitle={dateRangeLabel} padding="compact">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/30 via-transparent to-transparent p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-teal-400/10 blur-2xl" />
        <div className="relative flex flex-col gap-3 border-l-2 border-teal-500/35 pl-4 sm:flex-row sm:items-start sm:gap-4 sm:pl-5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${
              positive
                ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
                : 'bg-white/[0.06] text-emerald-200/70 ring-white/10'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 2.5a1 1 0 110 2 1 1 0 010-2zM9.5 11.5h-3v-1h1V8h-1V7h2v3.5h1v1z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className={`text-[13px] font-semibold tracking-tight ${adlTextPrimary}`}>Inventory Summary</h3>
              {positive && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300/90 ring-1 ring-emerald-500/25">
                  Healthy mix
                </span>
              )}
            </div>
            <p className="text-[13px] leading-relaxed text-emerald-100/55 sm:text-sm">
              {summary.trim() ||
                'Inventory signals will appear here once catalog and fulfillment activity is recorded for this range.'}
            </p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
