import Cart from 'components/cart';
import OpenCart from 'components/cart/open-cart';
import LogoSquare from 'components/logo-square';
import { getMenu } from 'lib/bigcommerce';
import { allPromoNavPath, navigationGroups as importedNavigationGroups } from 'lib/adesignline-data';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Suspense } from 'react';
import MobileMenu from './mobile-menu';
import Search from './search';

const navigationGroups = importedNavigationGroups;

const NAV_DROPDOWNS: (keyof typeof navigationGroups)[] = [
  'Brands',
  'Categories',
  'Men',
  'Women',
  'Featured Collections'
];

function Dropdown({ title }: { title: keyof typeof navigationGroups }) {
  const items = navigationGroups[title] ?? [];
  return (
    <div className="group relative">
      <button
        type="button"
        className="inline-flex items-center gap-0.5 whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-700 transition group-hover:text-black xl:text-[13px]"
      >
        {title}
        <ChevronDownIcon className="h-4 w-4 text-neutral-500" aria-hidden />
      </button>
      <div className="invisible absolute left-0 top-full z-50 min-w-[240px] pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
        <div className="border border-neutral-200 bg-white p-4 shadow-md">
          <div className="space-y-2">
            {items.map((item) => (
              <Link key={item.title} href={item.path} className="block text-[12px] text-neutral-600 transition hover:text-black">
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Navbar() {
  const menu = await getMenu('next-js-frontend-header-menu');

  return (
    <nav className="relative flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:px-6">
      <div className="block flex-none md:hidden">
        <Suspense>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-8">
        <div className="flex min-w-0 shrink-0 items-center gap-4 lg:gap-6">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-3" aria-label="A Design Line home">
            <LogoSquare />
            <span className="hidden text-[15px] font-semibold leading-tight tracking-[-0.03em] text-black md:inline lg:text-[1.0625rem]">
              A Design Line
            </span>
          </Link>
          <div className="hidden flex-wrap items-center gap-x-2 gap-y-2 md:flex lg:gap-x-3">
            {NAV_DROPDOWNS.map((key) => (
              <Dropdown key={key} title={key} />
            ))}
            <Link
              href={allPromoNavPath}
              className="whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.06em] text-neutral-700 transition hover:text-black xl:text-[13px]"
            >
              All Promo
            </Link>
          </div>
        </div>
        <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end gap-3 md:gap-4 lg:gap-5">
          <div className="hidden min-w-0 flex-1 md:max-w-md lg:max-w-xl xl:max-w-2xl md:block">
            <Suspense>
              <Search />
            </Suspense>
          </div>
          <Link
            href="/pages/contact"
            className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-700 transition hover:text-black md:inline-flex"
          >
            <UserIcon className="h-5 w-5 text-neutral-600" aria-hidden />
            <span className="hidden lg:inline">Sign In</span>
          </Link>
          <Suspense fallback={<OpenCart />}>
            <Cart />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
