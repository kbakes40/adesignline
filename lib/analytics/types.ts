export type DateRange = 'last7' | 'last30' | 'last90' | 'ytd';

export type DailyMetric = {
  date: string;
  value: number;
};

export type TopSellingItem = {
  name: string;
  quantitySold: number;
  revenue: number;
};

export type ChannelBreakdown = {
  channel: string;
  revenue: number;
  orders: number;
  profit: number;
};

export type CategoryBreakdown = {
  category: string;
  quantitySold: number;
};

export type AnalyticsDashboardData = {
  profit: number;
  profitChange: number;
  previousProfit: number;
  revenue: number;
  revenueChange: number;
  orders: number;
  averageOrderValue: number;
  profitTrend: DailyMetric[];
  revenueTrend: DailyMetric[];
  topSellingItems: TopSellingItem[];
  channelBreakdown: ChannelBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  dateRange: DateRange;
  dateRangeLabel: string;
};
