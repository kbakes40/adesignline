'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { SuggestPayload } from 'lib/search/suggest-engine';
import { productPathFromHandle } from 'lib/search/product-href';
import { createUrl } from 'lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

const RECENT_KEY = 'adl-search-recent';
const RECENT_MAX = 6;
const DEBOUNCE_MS = 280;

function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string) {
  const t = q.trim();
  if (t.length < 2) return;
  const prev = loadRecent().filter((x) => x.toLowerCase() !== t.toLowerCase());
  const next = [t, ...prev].slice(0, RECENT_MAX);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function money(n: number, code: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: code || 'USD' }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams?.get('q') ?? '';
  const [value, setValue] = useState(initialQ);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SuggestPayload | null>(null);
  const [active, setActive] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    setValue(initialQ);
  }, [initialQ]);

  const runFetch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as SuggestPayload;
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (value.trim() === '') {
      void runFetch('');
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void runFetch(value);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, open, runFetch]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const productList = data?.products ?? [];

  const flatNav = useMemo(() => {
    return productList.map((p) => ({ type: 'product' as const, p }));
  }, [productList]);

  useEffect(() => {
    if (active >= productList.length) setActive(productList.length > 0 ? productList.length - 1 : -1);
  }, [active, productList.length]);

  function submitSearch(q?: string) {
    const term = (q ?? value).trim();
    pushRecent(term);
    const params = new URLSearchParams(searchParams.toString());
    if (term) params.set('q', term);
    else params.delete('q');
    router.push(createUrl('/search', params));
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (!open || flatNav.length === 0) {
      if (e.key === 'Enter') submitSearch();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % flatNav.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? flatNav.length - 1 : i - 1));
    } else if (e.key === 'Enter' && active >= 0 && flatNav[active]) {
      e.preventDefault();
      const row = flatNav[active]!;
      router.push(productPathFromHandle(row.p.handle));
      pushRecent(value);
      setOpen(false);
    } else if (e.key === 'Enter') {
      submitSearch();
    }
  }

  const showEmptyPanel = open && value.trim().length === 0;
  const showTypedPanel = open && value.trim().length > 0;
  const showPanel = showEmptyPanel || showTypedPanel;

  return (
    <div ref={rootRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
        className="relative w-full"
        role="search"
        aria-label="Site search"
      >
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        <input
          type="search"
          name="search"
          placeholder="What are you looking for?"
          autoComplete="off"
          enterKeyHint="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-expanded={showPanel}
          aria-controls={showPanel ? listId : undefined}
          aria-autocomplete="list"
          role="combobox"
          className="w-full rounded-full border border-neutral-200/90 bg-white py-2.5 pl-11 pr-4 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 transition-[border-color,box-shadow] focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-200/80 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-neutral-700/50"
        />
      </form>

      {showPanel ? (
        <div
          id={listId}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] max-h-[min(70vh,520px)] overflow-y-auto rounded-2xl border border-neutral-200/90 bg-white/95 py-2 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18),0_4px_16px_-6px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04] backdrop-blur-md duration-200 dark:border-neutral-800 dark:bg-neutral-950/95"
        >
          {loading && value.trim().length >= 2 ? (
            <p className="px-4 py-3 text-[12px] text-neutral-500">Searching…</p>
          ) : null}

          {showEmptyPanel && data ? (
            <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Popular</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.popular.slice(0, 6).map((p) => (
                  <button
                    key={p.q}
                    type="button"
                    className="rounded-full border border-neutral-200/90 px-2.5 py-1 text-[11px] text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                    onClick={() => {
                      setValue(p.q);
                      submitSearch(p.q);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Brands & categories</p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                {data.brands.slice(0, 4).map((b) => (
                  <Link
                    key={b.href}
                    href={b.href}
                    className="text-neutral-600 underline-offset-2 hover:text-black hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    {b.label}
                  </Link>
                ))}
                <span className="text-neutral-300">·</span>
                {data.categories.slice(0, 4).map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="text-neutral-600 underline-offset-2 hover:text-black hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
              {loadRecent().length > 0 ? (
                <>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Recent</p>
                  <ul className="mt-1 space-y-0.5">
                    {loadRecent().map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          className="w-full rounded-lg px-2 py-1.5 text-left text-[12px] text-neutral-700 hover:bg-neutral-100"
                          onClick={() => {
                            setValue(r);
                            submitSearch(r);
                          }}
                        >
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}

          {showTypedPanel && data && data.products.length > 0 ? (
            <div className="border-b border-neutral-100 px-2 py-1.5 dark:border-neutral-800">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Products</p>
              {data.products.map((p, i) => {
                const isHi = i === active;
                return (
                  <Link
                    key={p.id}
                    href={productPathFromHandle(p.handle)}
                    role="option"
                    aria-selected={isHi}
                    className={`flex items-center gap-3 rounded-xl px-2 py-2 transition ${isHi ? 'bg-neutral-100' : 'hover:bg-neutral-50'}`}
                    onClick={() => {
                      setOpen(false);
                      pushRecent(value);
                    }}
                    onMouseEnter={() => setActive(i)}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-black/5">
                      {p.thumbnailUrl ? (
                        <Image src={p.thumbnailUrl} alt="" fill className="object-cover" sizes="48px" unoptimized />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-neutral-900">{p.title}</p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        {[p.brand, p.categoryLabel].filter(Boolean).join(' · ')}
                        {p.brand || p.categoryLabel ? ' · ' : null}
                        {money(p.priceMin, p.currencyCode)}
                        {p.priceMax !== p.priceMin ? ` – ${money(p.priceMax, p.currencyCode)}` : null}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {showTypedPanel && data && (data.brands.length > 0 || data.categories.length > 0) ? (
            <div className="grid gap-2 px-2 py-2 sm:grid-cols-2">
              {data.brands.length > 0 ? (
                <div>
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Brands</p>
                  <ul className="mt-1 space-y-0.5">
                    {data.brands.map((b) => (
                      <li key={b.href}>
                        <Link
                          href={b.href}
                          className="block rounded-lg px-2 py-1.5 text-[12px] text-neutral-800 hover:bg-neutral-100"
                          onClick={() => setOpen(false)}
                        >
                          {b.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {data.categories.length > 0 ? (
                <div>
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Categories</p>
                  <ul className="mt-1 space-y-0.5">
                    {data.categories.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className="block rounded-lg px-2 py-1.5 text-[12px] text-neutral-800 hover:bg-neutral-100"
                          onClick={() => setOpen(false)}
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {showTypedPanel && data && data.suggested.length > 0 ? (
            <div className="border-t border-neutral-100 px-2 py-2 dark:border-neutral-800">
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Suggestions</p>
              <ul className="mt-1">
                {data.suggested.map((s) => (
                  <li key={s.q}>
                    <button
                      type="button"
                      className="w-full rounded-lg px-2 py-1.5 text-left text-[12px] text-neutral-700 hover:bg-neutral-100"
                      onClick={() => {
                        setValue(s.q);
                        submitSearch(s.q);
                      }}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {!loading && showTypedPanel && value.trim().length >= 2 && data && data.products.length === 0 && data.suggested.length === 0 ? (
            <p className="px-4 py-3 text-[12px] text-neutral-500">No matches — try another term or browse categories.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
