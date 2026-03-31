import Link from 'next/link';

const limeSurface =
  'bg-[#76BC21] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.13)] ring-1 ring-black/[0.05]';
const darkSurface =
  'bg-[#1a1a1a] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] ring-1 ring-white/[0.05]';

const blocks = [
  {
    tone: 'lime' as const,
    title: 'HOW IT WORKS',
    button: 'LEARN ABOUT OUR PROCESS',
    href: '/pages/how-it-works'
  },
  {
    tone: 'dark' as const,
    title: 'Need a Quote? REQUEST ONE TODAY!',
    button: 'REQUEST A QUOTE',
    href: '/pages/quote-request'
  },
  {
    tone: 'lime' as const,
    title: 'WHY US? SEE WHAT SETS US APART',
    button: 'ABOUT US',
    href: '/pages/about'
  },
  {
    tone: 'dark' as const,
    title: 'NEED HELP? SPEAK WITH US TODAY!',
    button: 'CONTACT US',
    href: '/pages/contact'
  }
];

export default function CtaFourGrid() {
  return (
    <section className="border-y border-neutral-200/80 bg-[#f7f7f6] px-5 py-14 sm:px-8 sm:py-16 md:px-10 md:py-[4.5rem] lg:px-14 lg:py-20">
      <div className="mx-auto grid max-w-[min(100%,100rem)] grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-4 lg:gap-7">
        {blocks.map((b) => {
          const isLime = b.tone === 'lime';
          return (
            <div
              key={b.title}
              className={[
                'group relative flex min-h-[14.5rem] flex-col items-center justify-between rounded-2xl px-7 py-9 text-center shadow-sm transition-[transform,box-shadow] duration-300 ease-out sm:min-h-[15.5rem] sm:px-8 sm:py-10 md:min-h-[16rem] md:py-11',
                'motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md',
                isLime ? limeSurface : darkSurface
              ].join(' ')}
            >
              <p
                className={`max-w-[17.5rem] text-[0.9375rem] font-bold uppercase leading-snug tracking-[0.07em] sm:max-w-[18rem] sm:text-base md:text-[1.0625rem] md:leading-[1.4] ${isLime ? 'text-white' : 'text-white/95'}`}
              >
                {b.title}
              </p>
              <Link
                href={b.href}
                className={[
                  'inline-flex min-h-[2.75rem] min-w-[11.5rem] shrink-0 items-center justify-center rounded-lg border-2 px-6 py-2.5 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.13em] transition-[background-color,color,box-shadow,border-color] duration-200 sm:min-w-[12rem] sm:px-7 sm:text-[0.71875rem] sm:tracking-[0.12em]',
                  isLime
                    ? 'border-white/90 bg-white/[0.08] text-white hover:border-white hover:bg-white hover:text-[#0d4f52] hover:shadow-sm'
                    : 'border-white/85 bg-white/[0.06] text-white hover:border-white hover:bg-white hover:text-neutral-900 hover:shadow-sm'
                ].join(' ')}
              >
                {b.button}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
