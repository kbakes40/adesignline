'use client';

/** Inline empty state for charts — matches dashboard panel tone */
export function AnalyticsChartEmpty({ title }: { title: string }) {
  return (
    <div
      className="flex min-h-[10rem] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-950/40 bg-emerald-950/10 px-4 py-10 text-center"
      role="status"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/40">{title}</p>
      <p className="max-w-[14rem] text-xs leading-relaxed text-emerald-100/45">
        No inventory signals in this period. Adjust the reporting window or check back after new fulfillment activity.
      </p>
    </div>
  );
}
