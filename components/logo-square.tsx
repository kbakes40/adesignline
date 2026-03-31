import clsx from 'clsx';
import { BRAND_MARK_GREEN } from 'lib/constants';

export type LogoSquareVariant = 'icon' | 'text';

type LogoSquareProps = {
  size?: 'sm' | undefined;
  /** `icon` — solid brand green circle (default). `text` — compact “ADL” wordmark. */
  variant?: LogoSquareVariant;
};

export default function LogoSquare({ size, variant = 'icon' }: LogoSquareProps) {
  if (variant === 'text') {
    return (
      <div
        className={clsx('flex flex-none items-center justify-center border border-neutral-200 bg-white text-black', {
          'h-[40px] min-w-[40px] rounded-xl px-2': !size,
          'h-[30px] min-w-[30px] rounded-lg px-2': size === 'sm'
        })}
      >
        <span
          className={clsx('font-medium tracking-[-0.05em]', {
            'text-[11px]': !size,
            'text-[9px]': size === 'sm'
          })}
        >
          ADL
        </span>
      </div>
    );
  }

  const label = `${process.env.SITE_NAME ?? 'A Design Line'} logo`;

  return (
    <div
      className={clsx('shrink-0 rounded-full', {
        'size-11': !size,
        'size-9': size === 'sm'
      })}
      style={{ backgroundColor: BRAND_MARK_GREEN }}
      role="img"
      aria-label={label}
    />
  );
}
