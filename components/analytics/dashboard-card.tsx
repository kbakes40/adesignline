'use client';

import clsx from 'clsx';
import { type ReactNode } from 'react';
import { formatKpiUsd, safeFinite } from 'lib/analytics/format';
import {
  adlCardHero,
  adlCardPanel,
  adlKpiGlow,
  adlLabelMuted,
  adlTextPrimary,
  adlTextSecondary
} from './dashboard-styles';

export function DashboardCard({
  children,
  className,
  title,
  subtitle,
  variant = 'default',
  padding = 'comfortable'
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'hero';
  padding?: 'comfortable' | 'compact';
}) {
  const pad =
    variant === 'hero'
      ? 'p-6 sm:p-7 lg:p-8'
      : padding === 'compact'
        ? 'p-5 sm:p-6'
        : 'p-6 sm:p-7';
  return (
    <div
      className={clsx(
        variant === 'hero' ? adlCardHero : adlCardPanel,
        pad,
        'flex min-h-0 flex-col',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="relative z-[1] mb-5">
          {subtitle && <p className={adlLabelMuted}>{subtitle}</p>}
          {title && (
            <h3 className={clsx('mt-1 text-[15px] font-semibold tracking-tight', adlTextPrimary)}>{title}</h3>
          )}
        </div>
      )}
      <div className="relative z-[1] min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function MetricValue({
  value,
  prefix = '$',
  size = 'lg'
}: {
  value: string | number;
  prefix?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
}) {
  const sizeClasses = {
    sm: 'text-2xl sm:text-[1.65rem]',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl',
    xl: 'text-5xl sm:text-6xl tracking-tighter',
    hero: 'text-5xl sm:text-6xl lg:text-7xl tracking-tighter'
  };
  const display =
    typeof value === 'number' ? (Number.isFinite(value) ? formatKpiUsd(value) : '—') : value || '—';
  return (
    <p className={clsx('font-semibold tabular-nums', adlKpiGlow, adlTextPrimary, sizeClasses[size])}>
      {prefix && (
        <span className="mr-1 text-lg font-medium text-teal-300/75 sm:text-xl">{prefix}</span>
      )}
      {display}
    </p>
  );
}

export function ChangeIndicator({ change, label }: { change: number; label?: string }) {
  const finite = safeFinite(change);
  const isPositive = finite >= 0;
  const pct = Number.isFinite(change) ? `${Math.abs(finite).toFixed(1)}%` : '—';

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span
        className={clsx(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide',
          !Number.isFinite(change)
            ? 'bg-white/[0.06] text-emerald-200/50 ring-1 ring-white/10'
            : isPositive
              ? 'bg-emerald-500/15 text-emerald-300/95 ring-1 ring-emerald-500/25'
              : 'bg-red-950/40 text-red-300/90 ring-1 ring-red-500/20'
        )}
      >
        {Number.isFinite(change) && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={clsx(!isPositive && 'rotate-180')}
            aria-hidden
          >
            <path d="M5 2L8.5 7H1.5L5 2Z" fill="currentColor" />
          </svg>
        )}
        {pct}
      </span>
      {label && (
        <span className={clsx('max-w-[min(100%,14rem)] text-[11px] leading-snug', adlTextSecondary)}>{label}</span>
      )}
    </div>
  );
}

