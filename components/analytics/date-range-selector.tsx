'use client';

import clsx from 'clsx';
import type { DateRange } from 'lib/analytics/types';

const OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'ytd', label: 'Year to Date' }
];

type Props = {
  selected: DateRange;
  onChange: (range: DateRange) => void;
};

export function DateRangeSelector({ selected, onChange }: Props) {
  return (
    <div
      className="flex max-w-full flex-wrap gap-1.5 rounded-2xl border border-emerald-950/50 bg-[#050d0b]/60 p-1 backdrop-blur-md"
      role="group"
      aria-label="Reporting window"
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={selected === value}
          onClick={() => onChange(value)}
          className={clsx(
            'min-h-[40px] rounded-xl px-3 py-2 text-[11px] font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030a08]',
            selected === value
              ? 'bg-gradient-to-b from-teal-900/50 to-emerald-950/60 text-teal-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-teal-500/25'
              : 'text-emerald-200/45 hover:bg-white/[0.04] hover:text-emerald-100/75'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
