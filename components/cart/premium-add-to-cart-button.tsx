'use client';

import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import LoadingDots from 'components/loading-dots';
import { forwardRef } from 'react';

type PremiumAddToCartButtonProps = {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  /** From useFormStatus() in a component rendered inside the same <form> */
  pending: boolean;
  blocked?: boolean;
  success: boolean;
  /** compact = modal / sticky; roomy = PDP full width */
  size?: 'compact' | 'roomy';
};

export const PremiumAddToCartButton = forwardRef<HTMLButtonElement, PremiumAddToCartButtonProps>(
  function PremiumAddToCartButton(
    { availableForSale, selectedVariantId, pending, blocked, success, size = 'roomy' },
    ref
  ) {
    const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';
    const compact = size === 'compact';
    const base =
      'relative flex w-full items-center justify-center rounded-full bg-blue-600 font-medium tracking-wide text-white ' +
      'shadow-[0_1px_0_0_rgba(0,0,0,0.06)] transition-[transform,box-shadow,opacity,background-color] duration-100 ease-out ' +
      'active:scale-[0.985] active:shadow-inner active:duration-75 ' +
      (compact ? 'py-3.5 text-[13px]' : 'p-4 tracking-wide');

    if (!availableForSale) {
      return (
        <button type="button" disabled className={clsx(base, disabledClasses)} ref={ref}>
          {compact ? 'Out of stock' : 'Out Of Stock'}
        </button>
      );
    }

    if (!selectedVariantId) {
      return (
        <button
          type="button"
          disabled
          className={clsx(base, disabledClasses)}
          aria-label={compact ? 'Select options to add to cart' : 'Please select an option'}
          ref={ref}
        >
          <PlusIcon className={clsx('absolute', compact ? 'left-5 h-5 w-5' : 'left-0 ml-4 h-5')} />
          {compact ? 'Add to cart' : 'Add To Cart'}
        </button>
      );
    }

    const isBusy = pending || blocked;

    return (
      <button
        ref={ref}
        type="submit"
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          if (pending) e.preventDefault();
        }}
        aria-label="Add to cart"
        aria-disabled={isBusy}
        disabled={isBusy}
        className={clsx(base, {
          'hover:bg-blue-600/95': !isBusy && !success,
          [disabledClasses]: isBusy
        })}
      >
        <span className={clsx('absolute flex items-center justify-center', compact ? 'left-5' : 'left-0 ml-4')}>
          {isBusy ? (
            <LoadingDots className="mb-3 bg-white" />
          ) : success ? (
            <CheckIcon className="h-5 w-5 text-white" strokeWidth={2.25} />
          ) : (
            <PlusIcon className="h-5 w-5" />
          )}
        </span>
        {blocked ? 'Uploading artwork…' : success ? 'Added' : compact ? 'Add to cart' : 'Add To Cart'}
      </button>
    );
  }
);
