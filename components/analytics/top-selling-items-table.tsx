'use client';

import { formatUsd } from 'lib/analytics/format';
import { DashboardCard } from './dashboard-card';
import { adlLabelMuted, adlTextPrimary, adlTextSecondary } from './dashboard-styles';

type Props = {
  items: { name: string; quantitySold: number; revenue: number }[];
  dateRangeLabel: string;
};

export function TopSellingItemsTable({ items, dateRangeLabel }: Props) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <DashboardCard subtitle={dateRangeLabel}>
      <h3 className={`mb-5 text-center text-[13px] font-semibold tracking-tight ${adlTextPrimary}`}>
        Top 5 moving products
      </h3>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-xs text-emerald-100/45" role="status">
          No catalog movement in this period.
        </p>
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[260px] table-fixed">
            <colgroup>
              <col className="w-[55%] sm:w-auto" />
              <col className="w-[15%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th scope="col" className={`pb-3 pl-1 text-left ${adlLabelMuted}`}>
                  Item
                </th>
                <th scope="col" className={`pb-3 text-right ${adlLabelMuted}`}>
                  Qty
                </th>
                <th scope="col" className={`pb-3 pr-1 text-right ${adlLabelMuted}`}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, i) => (
                <tr
                  key={`${item.name}-${i}`}
                  className={[
                    'border-b border-white/[0.04] transition-colors duration-200 hover:bg-white/[0.03]',
                    i % 2 === 1 ? 'bg-white/[0.015]' : ''
                  ].join(' ')}
                >
                  <td
                    className={`max-w-0 py-3.5 pl-1 pr-2 text-sm font-medium leading-snug ${adlTextPrimary} sm:max-w-none`}
                  >
                    <span className="line-clamp-2 break-words sm:line-clamp-none">{item.name || '—'}</span>
                  </td>
                  <td className={`py-3.5 text-right text-sm tabular-nums ${adlTextSecondary}`}>
                    {Number.isFinite(item.quantitySold) ? item.quantitySold : '—'}
                  </td>
                  <td className="py-3.5 pr-1 text-right text-sm font-semibold tabular-nums text-teal-100/90">
                    ${formatUsd(Number.isFinite(item.revenue) ? item.revenue : 0, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );
}
