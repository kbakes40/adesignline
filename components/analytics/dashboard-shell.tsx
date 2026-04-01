'use client';

import type { AnalyticsDashboardData } from 'lib/analytics/types';
import { AovGaugeCard } from './aov-gauge-card';
import { InsightsCard } from './insights-card';
import { ItemsByCategoryChart } from './items-by-category-chart';
import { OrdersCard } from './orders-card';
import { ProfitByChannelBubble } from './profit-by-channel-bubble';
import { ProfitTrendCard } from './profit-trend-card';
import { RevenueBarChart } from './revenue-bar-chart';
import { TopSellingItemsTable } from './top-selling-items-table';

type Props = {
  data: AnalyticsDashboardData;
  insightsSummary: string;
};

export function DashboardShell({ data, insightsSummary }: Props) {
  return (
    <div className="space-y-6 sm:space-y-7 lg:space-y-8">
      {/* Top row — throughput hero height drives right column balance */}
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-6 xl:gap-7">
        <div className="min-w-0 lg:col-span-3">
          <ProfitTrendCard
            profit={data.profit}
            profitChange={data.profitChange}
            previousProfit={data.previousProfit}
            trend={data.profitTrend}
          />
        </div>
        <div className="min-w-0 lg:col-span-6">
          <RevenueBarChart
            revenue={data.revenue}
            trend={data.revenueTrend}
            dateRangeLabel={data.dateRangeLabel}
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col gap-5 lg:col-span-3 lg:min-h-[420px]">
          <OrdersCard orders={data.orders} dateRangeLabel={data.dateRangeLabel} />
          <AovGaugeCard aov={data.averageOrderValue} dateRangeLabel={data.dateRangeLabel} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-6 xl:gap-7">
        <div className="min-w-0 lg:col-span-4">
          <TopSellingItemsTable items={data.topSellingItems} dateRangeLabel={data.dateRangeLabel} />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <ProfitByChannelBubble channels={data.channelBreakdown} dateRangeLabel={data.dateRangeLabel} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col gap-5 lg:col-span-4">
          <ItemsByCategoryChart categories={data.categoryBreakdown} dateRangeLabel={data.dateRangeLabel} />
          <InsightsCard summary={insightsSummary} dateRangeLabel={data.dateRangeLabel} />
        </div>
      </div>
    </div>
  );
}
