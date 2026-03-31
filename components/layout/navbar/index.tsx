import BrandWordmarkLink from 'components/brand-wordmark';
import Cart from 'components/cart';
import OpenCart from 'components/cart/open-cart';
import { getMenu } from 'lib/bigcommerce';
import { allPromoNavPath, navigationGroups } from 'lib/adesignline-data';
import { UserIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Suspense } from 'react';
import MobileMenu from './mobile-menu';
import NavDropdown from './nav-dropdown';
import Search from './search';

const NAV_DROPDOWNS: (keyof typeof navigationGroups)[] = [
  'Brands',
  'Categories',
  'Men',
  'Women',
  'Featured Collections'
];

export default async function Navbar() {
  const menu = await getMenu('next-js-frontend-header-menu');

  return (
    <nav className="flex w-full items-center justify-between gap-x-3 border-b border-neutral-200 bg-white px-4 py-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:justify-normal md:gap-x-4 lg:px-6 lg:py-5">
      <div className="flex min-w-0 items-center gap-3 md:gap-4 lg:gap-6">
        <div className="md:hidden">
          <Suspense>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>
        <BrandWordmarkLink variant="nav" />
      </div>

      <div className="hidden flex-wrap items-center justify-center gap-x-2 gap-y-2 md:flex md:px-2 lg:gap-x-3">
        {NAV_DROPDOWNS.map((key) => (
          <NavDropdown key={key} title={key} />
        ))}
        <Link
          href={allPromoNavPath}
          className="whitespace-nowrap text-[14px] font-semibold uppercase tracking-[0.05em] text-neutral-700 transition hover:text-black xl:text-[15px]"
        >
          All Promo
        </Link>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-3 md:gap-4 lg:gap-5">
        <div className="hidden min-w-0 flex-1 md:max-w-sm lg:max-w-md xl:max-w-lg md:block">
          <Suspense>
            <Search />
          </Suspense>
        </div>
        <Link
          href="/pages/contact"
          className="hidden items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-neutral-700 transition hover:text-black md:inline-flex"
        >
          <UserIcon className="h-5 w-5 text-neutral-600" aria-hidden />
          <span className="hidden lg:inline">Sign In</span>
        </Link>
        <Suspense fallback={<OpenCart />}>
          <Cart />
        </Suspense>
      </div>
    </nav>
  );
}
