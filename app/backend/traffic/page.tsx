import { getTrafficData } from 'lib/traffic/get-traffic-data';
import type { TrafficDateRange } from 'lib/traffic/types';
import { Suspense } from 'react';
import { TrafficPageClient } from './page-client';

type SearchParams = Promise<{ range?: string }>;

function toRange(raw?: string): TrafficDateRange {
  if (raw === 'last7' || raw === 'last30' || raw === 'last90' || raw === 'ytd') return raw;
  return 'last30';
}

async function DashboardContent({ range }: { range: TrafficDateRange }) {
  const result = await getTrafficData(range);
  return <TrafficPageClient key={range} initialResult={result} />;
}

function TrafficSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="h-20 animate-pulse border-b border-orange-950/30 bg-[#1c0a02]/50" />
      <div className="mx-auto max-w-[1520px] space-y-7 px-5 pb-12 pt-10 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-96 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20 lg:col-span-3" />
          <div className="space-y-6 lg:col-span-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-72 animate-pulse rounded-3xl border border-orange-900/30 bg-orange-950/15" />
              <div className="h-72 animate-pulse rounded-3xl border border-orange-900/30 bg-orange-950/15" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-64 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20" />
              <div className="h-64 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20" />
            </div>
          </div>
          <div className="space-y-6 lg:col-span-3">
            <div className="h-56 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20" />
            <div className="h-72 animate-pulse rounded-3xl border border-orange-950/30 bg-orange-950/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TrafficPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const range = toRange(params.range);

  return (
    <Suspense fallback={<TrafficSkeleton />}>
      <DashboardContent range={range} />
    </Suspense>
  );
}
