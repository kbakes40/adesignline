/**
 * Shared Tailwind class patterns for the A Design Line Inventory Intelligence dashboard.
 * Styling-only — keep in sync with card components; no data logic.
 */

/** Standard analytics panel — dark green undertone, soft border, inner highlight */
export const adlCardPanel =
  'relative overflow-hidden rounded-3xl border border-emerald-950/50 bg-gradient-to-br from-white/[0.07] via-emerald-950/[0.18] to-[#050d0b]/90 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-800/40 hover:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.08)]';

/** Hero chart card — stronger presence, subtle top glow (padding applied by DashboardCard) */
export const adlCardHero =
  'relative overflow-hidden rounded-3xl border border-teal-900/45 bg-gradient-to-br from-teal-950/30 via-emerald-950/25 to-[#040a08]/95 shadow-[0_12px_48px_-16px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-teal-800/50 hover:shadow-[0_20px_56px_-20px_rgba(0,0,0,0.65)] before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-[radial-gradient(ellipse_90%_55%_at_50%_-30%,rgba(45,212,191,0.14),transparent_65%)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/[0.07] after:to-transparent';

/** KPI emphasis — soft glow behind headline numbers */
export const adlKpiGlow = 'relative [text-shadow:0_0_40px_rgba(45,212,191,0.12)]';

/** Muted label — editorial secondary */
export const adlLabelMuted = 'text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200/45';

/** Section kicker under hero titles */
export const adlSectionKicker = 'text-xs font-medium tracking-wide text-emerald-100/35';

/** Primary body on dark — soft white, not harsh */
export const adlTextPrimary = 'text-[#e8f2ee]';

/** Secondary — sage gray */
export const adlTextSecondary = 'text-emerald-100/45';

/** Tooltip shell for Recharts custom tooltips */
export const adlTooltipShell =
  'rounded-xl border border-emerald-900/60 bg-[#071512]/95 px-3.5 py-2 text-xs text-[#e8f2ee] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)] backdrop-blur-md';

export const adlCategoryBarFills = [
  '#5eead4',
  '#2dd4bf',
  '#34d399',
  '#6ee7b7',
  '#86b8a8',
  '#5d9c8c',
  '#4a7c72'
];

/** Channel bubble tints — luxury green family only */
export const adlChannelBubbleStyles: { fill: string; ring: string }[] = [
  { fill: 'rgba(45,212,191,0.35)', ring: 'rgba(45,212,191,0.45)' },
  { fill: 'rgba(16,185,129,0.32)', ring: 'rgba(16,185,129,0.4)' },
  { fill: 'rgba(20,184,166,0.3)', ring: 'rgba(20,184,166,0.42)' },
  { fill: 'rgba(52,211,153,0.28)', ring: 'rgba(52,211,153,0.38)' },
  { fill: 'rgba(110,231,183,0.22)', ring: 'rgba(110,231,183,0.35)' },
  { fill: 'rgba(134,184,168,0.28)', ring: 'rgba(134,184,168,0.4)' }
];
