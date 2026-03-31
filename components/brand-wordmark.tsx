import Image from 'next/image';
import Link from 'next/link';

/** Source: [wordmark PNG](https://drive.google.com/file/d/13JBvBafeeWo4IQe6FJxIS-Id2MUzl615/view?usp=drive_link) — served from `public/home/a-design-line-wordmark.png`. */
const WORDMARK_SRC = '/home/a-design-line-wordmark.png';
const NATURAL_W = 1003;
const NATURAL_H = 221;

type BrandWordmarkLinkProps = {
  /** Header bar vs footer column */
  variant?: 'nav' | 'footer';
};

export default function BrandWordmarkLink({ variant = 'nav' }: BrandWordmarkLinkProps) {
  const sizeClass =
    variant === 'nav'
      ? 'h-12 w-auto max-h-16 sm:h-[3.25rem] md:h-14 lg:h-[3.75rem] xl:h-16'
      : 'h-12 w-auto sm:h-[3.25rem] md:h-14 lg:h-[3.75rem]';

  return (
    <Link
      href="/"
      className="inline-flex min-w-0 max-w-full shrink-0 items-center"
      aria-label="A Design Line home"
    >
      <Image
        src={WORDMARK_SRC}
        alt="A Design Line"
        width={NATURAL_W}
        height={NATURAL_H}
        className={`${sizeClass} max-w-[min(100%,26rem)] object-contain object-left sm:max-w-[28rem] md:max-w-[32rem] lg:max-w-[36rem] xl:max-w-[42rem] 2xl:max-w-none`}
        priority={variant === 'nav'}
        unoptimized
      />
    </Link>
  );
}
