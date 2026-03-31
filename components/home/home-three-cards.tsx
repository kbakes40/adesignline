import Link from 'next/link';

const cards = [
  {
    title: 'Patches',
    subtitle: 'Shop custom patches',
    href: '/search/patches',
    image: '/home/patches.webp'
  },
  {
    title: 'Gift Ideas',
    subtitle: 'Gifts for any occasion',
    href: '/search/gift-ideas',
    image: '/home/gift-ideas.webp'
  },
  {
    title: 'More Than Apparel',
    subtitle: 'Ideas that make your brand pop',
    /** In-app full catalog browse (mirrors live “All Products” / promo browse). */
    href: '/search',
    image: '/home/more-than-apparel.jpg'
  }
] as const;

export default function HomeThreeCards() {
  return (
    <section className="bg-white px-4 pt-10 pb-14 sm:px-8 md:pt-14 md:pb-20 lg:px-10 lg:pb-24 xl:px-12">
      <div className="mx-auto max-w-[min(100%,124rem)]">
        <p className="mb-8 text-center text-[15px] font-semibold uppercase tracking-[0.22em] text-neutral-500 md:mb-12">
          Featured collections
        </p>
        <div className="grid gap-11 sm:gap-12 md:grid-cols-3 md:gap-14 lg:gap-16 xl:gap-[4.25rem]">
          {cards.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              aria-label={`${c.title} — ${c.subtitle}`}
              className="group relative block w-full overflow-hidden rounded-2xl shadow-[0_8px_30px_-8px_rgba(0,0,0,0.22)] ring-1 ring-black/[0.06] transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.28)] hover:ring-black/10 aspect-[16/10] min-h-[328px] md:aspect-[16/9] md:min-h-[308px] lg:min-h-[352px] xl:min-h-[372px]"
            >
              <div
                className="absolute inset-0 scale-100 bg-cover bg-center transition duration-500 ease-out group-hover:scale-[1.04]"
                style={{ backgroundImage: `url(${c.image})` }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
