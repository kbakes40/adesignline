/** Date window aligned with Inventory Intelligence dashboards */
export type TrafficDateRange = 'last7' | 'last30' | 'last90' | 'ytd';

export type TrafficTableMode = 'keyword' | 'landing';

export type TrafficKpi = {
  label: string;
  valueDisplay: string;
  /** Percentage points or ratio change vs prior window (semantic per metric) */
  changePct: number | null;
  /** True when an increase in the raw metric is “good” (e.g. duration up) */
  higherIsBetter: boolean;
};

export type TrafficChannelRow = {
  channel: string;
  sessions: number;
  users: number;
};

export type TrafficTableRow = {
  label: string;
  sessions: number;
};

export type TrafficDashboardData = {
  dateRange: TrafficDateRange;
  dateRangeLabel: string;
  kpis: {
    bounceRate: TrafficKpi;
    viewsPerSession: TrafficKpi;
    avgSessionDuration: TrafficKpi;
    percentNewUsers: TrafficKpi;
  };
  totals: {
    sessions: number;
    totalUsers: number;
    sessionsPrev: number;
    totalUsersPrev: number;
  };
  usersTrend: { date: string; value: number }[];
  sessionsTrend: { date: string; value: number }[];
  channelBySessions: TrafficChannelRow[];
  channelByUsers: TrafficChannelRow[];
  tableMode: TrafficTableMode;
  tableTitle: string;
  tableRows: TrafficTableRow[];
  summary: string;
  summaryBadge: string;
};

export type TrafficResult =
  | { ok: false; reason: 'setup'; missingEnv: string[] }
  | { ok: false; reason: 'error'; message: string }
  | { ok: true; data: TrafficDashboardData };
