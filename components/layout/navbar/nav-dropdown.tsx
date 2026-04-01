import Image from 'next/image';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { navigationGroups } from 'lib/adesignline-data';
import { brandNavLogoSrc } from 'lib/brand-nav-logos';

export type NavDropdownTitle = keyof typeof navigationGroups;

const panelClassName =
  'min-w-[min(100vw-2rem,17.5rem)] rounded-2xl border border-white/70 bg-white/80 px-5 py-5 shadow-[0_12px_42px_-10px_rgba(15,23,42,0.14),0_4px_18px_-6px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04] backdrop-blur-xl backdrop-saturate-150 sm:min-w-[19rem] md:px-6 md:py-6';

/** Wide panel for Categories two-column grid. */
const panelWideClassName = 'sm:min-w-[26rem] lg:min-w-[28rem]';

const brandsPanelClassName = 'flex flex-col gap-0.5';

const linkBaseClassName =
  'block rounded-xl px-3 py-2.5 text-[15px] font-medium leading-[1.65] text-neutral-700 transition-[background-color,color,box-shadow] duration-200 ease-out hover:bg-neutral-100/85 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300/80 focus-visible:ring-offset-2';

const categoriesGridClassName = 'grid grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-0.5';

function DropdownEyebrow({ children, className = '' }: { children: string; className?: string }) {
  return (
    <p
      className={`mb-3 border-b border-neutral-200/80 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 ${className}`}
    >
      {children}
    </p>
  );
}

/** One brand in the horizontal strip: logo above label, fixed min width so nothing shrinks. */
function BrandTile({ title, path }: { title: string; path: string }) {
  const logoSrc = brandNavLogoSrc[title];
  return (
    <Link
      href={path}
      className="flex min-w-[4.5rem] max-w-[5.75rem] shrink-0 flex-col items-center gap-1 rounded-xl px-1.5 py-1.5 text-center transition-[background-color,color] duration-200 hover:bg-neutral-100/85 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300/80 focus-visible:ring-offset-2 sm:min-w-[5rem] sm:max-w-[6.5rem] sm:gap-1.5 sm:py-2"
    >
      <span className="flex h-9 w-full items-center justify-center sm:h-10">
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt=""
            width={88}
            height={32}
            className="h-7 w-auto max-h-8 max-w-[4.75rem] object-contain object-center opacity-[0.92] sm:h-8 sm:max-h-9 sm:max-w-[5.5rem]"
            unoptimized
          />
        ) : (
          <span className="text-[9px] font-semibold uppercase tracking-wide text-neutral-400" aria-hidden>
            —
          </span>
        )}
      </span>
      <span className="w-full text-[10px] font-medium leading-snug text-neutral-700 sm:text-[11px]">{title}</span>
    </Link>
  );
}

function BrandDropdownLink({ title, path }: { title: string; path: string }) {
  const logoSrc = brandNavLogoSrc[title];
  return (
    <Link
      href={path}
      className={`${linkBaseClassName} flex items-center gap-3`}
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt=""
          width={72}
          height={24}
          className="h-5 w-auto max-w-[4rem] object-contain opacity-[0.88]"
          unoptimized
        />
      ) : null}
      <span>{title}</span>
    </Link>
  );
}

function TextLink({ title, path }: { title: string; path: string }) {
  return (
    <Link href={path} className={linkBaseClassName}>
      {title}
    </Link>
  );
}

export default function NavDropdown({ title }: { title: NavDropdownTitle }) {
  const items = navigationGroups[title] ?? [];
  const isBrands = title === 'Brands';
  const isCategories = title === 'Categories';

  const panelClasses = isBrands
    ? `${panelClassName} ${brandsPanelClassName}`
    : isCategories
      ? `${panelClassName} ${panelWideClassName} ${categoriesGridClassName}`
      : `${panelClassName} flex flex-col gap-0.5`;

  return (
    <div className="group/nav-dropdown relative">
      <button
        type="button"
        className="inline-flex items-center gap-1 whitespace-nowrap text-[14px] font-semibold uppercase tracking-[0.05em] text-neutral-700 transition-colors duration-200 group-hover/nav-dropdown:text-black xl:text-[15px]"
        aria-haspopup="true"
      >
        {title}
        <ChevronDownIcon
          className="h-[1.125rem] w-[1.125rem] shrink-0 text-neutral-500 transition-transform duration-300 ease-out group-hover/nav-dropdown:rotate-180 group-hover/nav-dropdown:text-neutral-600"
          aria-hidden
        />
      </button>
      <div className="pointer-events-none absolute left-0 top-full z-50 origin-top translate-y-1.5 scale-[0.99] pt-4 opacity-0 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none group-hover/nav-dropdown:pointer-events-auto group-hover/nav-dropdown:translate-y-0 group-hover/nav-dropdown:scale-100 group-hover/nav-dropdown:opacity-100">
        <div className="absolute -top-4 left-0 right-0 h-4" aria-hidden />
        <div className={panelClasses}>
          {isBrands ? (
            <>
              <DropdownEyebrow>Shop by brand</DropdownEyebrow>
              {items.map((item) => (
                <BrandDropdownLink key={item.title} title={item.title} path={item.path} />
              ))}
            </>
          ) : null}
          {isCategories ? <DropdownEyebrow className="col-span-full">Browse by category</DropdownEyebrow> : null}
          {isCategories ? items.map((item) => <TextLink key={item.title} title={item.title} path={item.path} />) : null}
          {!isBrands && !isCategories
            ? items.map((item) => <TextLink key={item.title} title={item.title} path={item.path} />)
            : null}
        </div>
      </div>
    </div>
  );
}
