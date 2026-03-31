'use client';

import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export default function OpenCart({
  className,
  quantity
}: {
  className?: string;
  quantity?: number;
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const bump = () => setPulse(true);
    window.addEventListener('cart:added', bump);
    return () => window.removeEventListener('cart:added', bump);
  }, []);

  useEffect(() => {
    if (pulse) {
      const t = window.setTimeout(() => setPulse(false), 520);
      return () => window.clearTimeout(t);
    }
  }, [pulse]);

  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <ShoppingCartIcon
        className={clsx(
          'h-4 transition-transform duration-150 ease-out',
          pulse && 'scale-110',
          className
        )}
      />

      {quantity ? (
        <span
          key={quantity}
          className="cart-badge-tick absolute right-0 top-0 -mr-2 -mt-2 flex h-[18px] min-w-[18px] items-center justify-center rounded bg-blue-600 px-0.5 text-[11px] font-medium tabular-nums text-white animate-cartBadgePop"
        >
          {quantity > 99 ? '99+' : quantity}
        </span>
      ) : null}
    </div>
  );
}
