'use client';

import { BuildingStorefrontIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { BrandSidebarRow } from 'lib/brand-explorer';
import Link from 'next/link';
import { useMemo, useState } from 'react';

function BrandLogo({
  label,
  iconSlug,
  iconUrl
}: {
  label: string;
  iconSlug?: string;
  iconUrl?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = iconUrl
    ? iconUrl
    : iconSlug
      ? `https://cdn.simpleicons.org/${iconSlug}/111111`
      : undefined;

  if (!src || failed) {
    const initials = label
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-700">
        {initials}
      </div>
    );
  }
  return (
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-white p-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-7 w-7 object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function BrandSidebar({ rows }: { rows: BrandSidebarRow[] }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) => r.label.toLowerCase().includes(s));
  }, [rows, q]);

  return (
    <div className="rounded-lg border border-neutral-200 bg-[#f8f7f4] p-2.5 shadow-sm">
      <details open className="group">
        <summary className="cursor-pointer list-none py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-600 marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between">
            Brand
            <span className="text-neutral-400 transition group-open:rotate-180">▼</span>
          </span>
        </summary>
        <div className="mt-2 space-y-2 border-t border-neutral-200/80 pt-2">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search brand..."
              className="w-full rounded-full border border-neutral-200 bg-white py-2 pl-9 pr-3 text-[12px] text-neutral-900 placeholder:text-neutral-400 focus:border-teal-600/40 focus:outline-none focus:ring-2 focus:ring-teal-600/15"
              aria-label="Filter brands"
            />
          </div>
          <ul className="space-y-0.5 pr-1">
            {filtered.map((row) => (
              <li key={row.id}>
                <Link
                  href={row.href}
                  scroll={false}
                  className={[
                    'flex items-center gap-2 rounded-md px-1.5 py-1.5 text-[12px] transition',
                    row.active
                      ? 'bg-teal-50 font-medium text-teal-900 ring-1 ring-teal-600/25'
                      : 'text-neutral-700 hover:bg-white hover:text-black'
                  ].join(' ')}
                >
                  {row.id === 'all-brands' ? (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-neutral-200 bg-white text-neutral-500">
                      <BuildingStorefrontIcon className="h-5 w-5" aria-hidden />
                    </span>
                  ) : (
                    <BrandLogo label={row.label} iconSlug={row.iconSlug} iconUrl={row.iconUrl} />
                  )}
                  <span className="min-w-0 flex-1 truncate">{row.label}</span>
                  <span className="shrink-0 tabular-nums text-neutral-400">{row.count}</span>
                  {row.active ? <CheckIcon className="h-4 w-4 shrink-0 text-teal-600" aria-hidden /> : null}
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length === 0 ? <p className="py-2 text-center text-[12px] text-neutral-500">No matches</p> : null}
        </div>
      </details>
    </div>
  );
}
