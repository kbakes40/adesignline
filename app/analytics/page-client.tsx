'use client';

import { DateRangeSelector } from 'components/analytics/date-range-selector';
import { DashboardShell } from 'components/analytics/dashboard-shell';
import type { AnalyticsDashboardData, DateRange } from 'lib/analytics/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

const RANGE_VALUES: DateRange[] = ['last7', 'last30', 'last90', 'ytd'];

function parseDateRange(raw: string | null): DateRange {
  return raw && RANGE_VALUES.includes(raw as DateRange) ? (raw as DateRange) : 'last30';
}

type Props = {
  initialData: AnalyticsDashboardData;
  initialSummary: string;
};

export function AnalyticsPageClient({ initialData, initialSummary }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [data] = useState(initialData);
  const [summary] = useState(initialSummary);

  const currentRange = parseDateRange(searchParams.get('range'));

  const handleRangeChange = useCallback(
    (range: DateRange) => {
      startTransition(() => {
        router.push(`/analytics?range=${range}`);
      });
    },
    [router]
  );

  return (
    <div className="relative min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#030a08]/75 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-[1520px] min-w-0 flex-col gap-5 px-5 py-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 shrink-0 lg:max-w-[42%]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-200/40">A Design Line</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#e8f2ee] sm:text-2xl">
              Inventory Intelligence
            </h1>
            <p className="mt-1 text-xs text-emerald-100/40">
              Inventory visibility and catalog health overview
            </p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <DateRangeSelector selected={currentRange} onChange={handleRangeChange} />
            <button
              type="button"
              onClick={() => handleRangeChange(currentRange)}
              className="flex h-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-emerald-950/50 bg-[#050d0b]/50 text-emerald-200/50 transition-colors duration-200 hover:border-teal-800/40 hover:bg-white/[0.04] hover:text-teal-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030a08]"
              title="Refresh"
            >
              <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M12.25 7a5.25 5.25 0 11-1.54-3.71"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.25 1.75v3.5h-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1520px] px-5 pb-12 pt-8 sm:px-8 sm:pb-14 sm:pt-10">
        <div
          className={
            isPending
              ? 'pointer-events-none opacity-45 transition-opacity duration-300'
              : 'transition-opacity duration-300'
          }
        >
          <DashboardShell data={data} insightsSummary={summary} />
        </div>
      </div>
    </div>
  );
}
