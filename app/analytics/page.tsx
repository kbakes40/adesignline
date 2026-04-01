import { getAnalyticsData } from 'lib/analytics/get-analytics-data';
import { generateInsightsSummary } from 'lib/analytics/insights';
import type { DateRange } from 'lib/analytics/types';
import { Suspense } from 'react';
import { AnalyticsPageClient } from './page-client';

type SearchParams = Promise<{ range?: string }>;

function toDateRange(raw?: string): DateRange {
  if (raw === 'last7' || raw === 'last30' || raw === 'last90' || raw === 'ytd') return raw;
  return 'last30';
}

async function DashboardContent({ range }: { range: DateRange }) {
  const data = await getAnalyticsData(range);
  const summary = generateInsightsSummary(data);
  return <AnalyticsPageClient initialData={data} initialSummary={summary} />;
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-20 animate-pulse border-b border-white/[0.06] bg-[#030a08]/50" />
      <div className="mx-auto max-w-[1520px] space-y-7 px-5 pb-12 pt-10 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-72 animate-pulse rounded-3xl border border-emerald-950/30 bg-emerald-950/20 lg:col-span-3" />
          <div className="h-96 animate-pulse rounded-3xl border border-teal-900/30 bg-teal-950/15 lg:col-span-6" />
          <div className="h-72 animate-pulse rounded-3xl border border-emerald-950/30 bg-emerald-950/20 lg:col-span-3" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-3xl border border-emerald-950/30 bg-emerald-950/20" />
          <div className="h-80 animate-pulse rounded-3xl border border-emerald-950/30 bg-emerald-950/20" />
          <div className="h-80 animate-pulse rounded-3xl border border-emerald-950/30 bg-emerald-950/20" />
        </div>
      </div>
    </div>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const range = toDateRange(params.range);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent range={range} />
    </Suspense>
  );
}
