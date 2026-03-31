'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { createUrl } from 'lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const val = e.target as HTMLFormElement;
    const search = val.search as HTMLInputElement;
    const newParams = new URLSearchParams(searchParams.toString());

    if (search.value) {
      newParams.set('q', search.value);
    } else {
      newParams.delete('q');
    }

    router.push(createUrl('/search', newParams));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full max-w-xl md:max-w-2xl"
      role="search"
      aria-label="Site search"
    >
      <MagnifyingGlassIcon
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
        aria-hidden
      />
      <input
        key={searchParams?.get('q') ?? ''}
        type="search"
        name="search"
        placeholder="What are you looking for?"
        autoComplete="off"
        enterKeyHint="search"
        defaultValue={searchParams?.get('q') || ''}
        className="w-full rounded-full border border-neutral-200/90 bg-white py-3 pl-12 pr-5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 transition-[border-color,box-shadow] focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-200/80 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-500 dark:focus:ring-neutral-700/50"
      />
    </form>
  );
}
