'use client';

import { DashboardCard } from './dashboard-card';
import { adlChannelBubbleStyles, adlLabelMuted, adlTextPrimary } from './dashboard-styles';

type Props = {
  channels: { channel: string; revenue: number; orders: number; profit: number }[];
  dateRangeLabel: string;
};

export function ProfitByChannelBubble({ channels, dateRangeLabel }: Props) {
  const list = Array.isArray(channels) ? channels : [];
  const maxRevenue = list.length ? Math.max(...list.map((c) => (Number.isFinite(c.revenue) ? c.revenue : 0)), 1) : 1;

  return (
    <DashboardCard subtitle={dateRangeLabel}>
      <h3 className={`mb-5 text-center text-[13px] font-semibold tracking-tight ${adlTextPrimary}`}>
        Margin by channel
      </h3>
      {list.length === 0 ? (
        <p className="py-10 text-center text-xs text-emerald-100/45" role="status">
          No channel mix for this period.
        </p>
      ) : (
        <>
      <div className="flex flex-wrap items-center justify-center gap-3 py-4 sm:gap-4">
        {list.map((ch, i) => {
          const rev = Number.isFinite(ch.revenue) ? ch.revenue : 0;
          const size = 40 + (rev / maxRevenue) * 52;
          const style = adlChannelBubbleStyles[i % adlChannelBubbleStyles.length]!;
          return (
            <div
              key={`${ch.channel}-${i}`}
              className="group relative flex items-center justify-center rounded-full transition-transform duration-200 ease-out hover:scale-[1.04]"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                background: style.fill,
                boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.12), 0 0 0 1px ${style.ring}`
              }}
              title={`${ch.channel}: $${(Number.isFinite(ch.profit) ? ch.profit : 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} margin`}
            >
              <span className="max-w-[90%] truncate px-1 text-center text-[9px] font-semibold uppercase tracking-wider text-white/90">
                {ch.channel.slice(0, 3)}
              </span>
              <div className="pointer-events-none absolute -bottom-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-emerald-900/60 bg-[#071512]/95 px-2.5 py-1 text-[10px] text-teal-50 opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                ${(Number.isFinite(ch.profit) ? ch.profit : 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}{' '}
                margin
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-white/[0.05] pt-4">
        {list.map((ch, i) => {
          const style = adlChannelBubbleStyles[i % adlChannelBubbleStyles.length]!;
          return (
            <div key={`${ch.channel}-leg-${i}`} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/10"
                style={{ background: style.fill }}
              />
              <span className={`text-[10px] font-medium ${adlLabelMuted}`}>{ch.channel}</span>
            </div>
          );
        })}
      </div>
        </>
      )}
    </DashboardCard>
  );
}
