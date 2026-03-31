import clsx from 'clsx';
import Link from 'next/link';

/** Supporting category entry points — tone hints via gradient, not loud color. */
const categories = [
  {
    title: 'T-Shirts',
    href: '/search/categories?q=t-shirt',
    /** [Drive asset](https://drive.google.com/file/d/178N4hD6IeNrrWbHsJX1AoOQyZEoi9x-Z/view?usp=sharing) */
    image: '/home/category-t-shirts.jpg',
    overlayClass: 'from-neutral-950/88 via-neutral-900/45 to-neutral-950/15'
  },
  {
    title: 'Outerwear',
    href: '/search/categories?q=outerwear',
    /** [Drive asset](https://drive.google.com/file/d/1tI1zlzsjPdC-ZkqdPKFJi67jlUZblNoR/view?usp=sharing) */
    image: '/home/category-outerwear.jpg',
    overlayClass: 'from-slate-950/90 via-slate-900/50 to-slate-950/20'
  },
  {
    title: 'Eco-Friendly',
    href: '/search/categories?q=eco-friendly',
    /** [Drive asset](https://drive.google.com/file/d/1WTSUoiwkFEFh-ZmFMHCneetFBP2WQ5Ol/view?usp=sharing) */
    image: '/home/category-eco-friendly.jpg',
    overlayClass: 'from-emerald-950/85 via-emerald-900/40 to-emerald-950/15'
  },
  {
    title: 'Safety',
    href: '/search/categories?q=safety',
    /** [Drive asset](https://drive.google.com/file/d/1JXw-KhDVJsI7AfbUXy5E5owECcKrge1q/view?usp=sharing) */
    image: '/home/category-safety.jpg',
    overlayClass: 'from-zinc-950/92 via-zinc-900/48 to-zinc-950/18'
  }
] as const;

export default function CategoryFourGrid() {
  return (
    <section className="bg-white px-4 pt-9 pb-11 sm:px-8 md:pt-11 md:pb-12 lg:px-10 lg:pb-14 xl:px-12">
      <div className="mx-auto max-w-[min(100%,124rem)]">
        <p className="mb-7 text-center text-[15px] font-semibold uppercase tracking-[0.22em] text-neutral-500 md:mb-9 md:text-base">
          Shop by category
        </p>
        <div className="grid grid-cols-2 gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:grid-cols-4 xl:gap-9">
          {categories.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className={clsx(
                'group relative aspect-square w-full overflow-hidden rounded-2xl',
                'shadow-[0_6px_24px_-6px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.06]',
                'transition duration-300 ease-out',
                'hover:-translate-y-1 hover:shadow-[0_18px_38px_-10px_rgba(0,0,0,0.28)] hover:ring-black/10'
              )}
            >
              <div
                className="absolute inset-0 scale-100 bg-cover bg-center transition duration-500 ease-out group-hover:scale-[1.05]"
                style={{ backgroundImage: `url(${c.image})` }}
              />
              <div
                className={clsx(
                  'absolute inset-0 bg-gradient-to-t',
                  c.overlayClass
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/5" />
              <div className="relative z-10 flex h-full flex-col items-center justify-end px-3 pb-6 pt-14 text-center sm:px-4 sm:pb-7 sm:pt-16 md:px-5 md:pb-8">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-xs">
                  Browse
                </span>
                <span
                  className={clsx(
                    'mt-1.5 text-[clamp(1.2rem,4vw,2.35rem)] font-bold leading-tight tracking-[0.05em] text-white',
                    'md:text-[clamp(1.25rem,2.8vw,2.35rem)]',
                    'drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
                  )}
                >
                  {c.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
