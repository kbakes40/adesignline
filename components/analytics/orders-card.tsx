'use client';

import { DashboardCard, MetricValue } from './dashboard-card';
import { adlSectionKicker } from './dashboard-styles';

type Props = {
  orders: number;
  dateRangeLabel: string;
};

export function OrdersCard({ orders, dateRangeLabel }: Props) {
  return (
    <DashboardCard subtitle={dateRangeLabel} className="flex-1 justify-center" padding="compact">
      <div className="text-center">
        <p className={adlSectionKicker}>Fulfillments</p>
        <MetricValue value={orders} prefix="" size="hero" />
      </div>
    </DashboardCard>
  );
}
