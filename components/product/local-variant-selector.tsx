'use client';

import clsx from 'clsx';
import {
  VercelProductOption as ProductOption,
  VercelProductVariant as ProductVariant
} from 'lib/bigcommerce/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

function buildInitialSelected(variants: ProductVariant[]): Record<string, string> {
  const v = variants[0];
  if (!v?.selectedOptions.length) return {};
  return Object.fromEntries(v.selectedOptions.map((o) => [o.name.toLowerCase(), o.value]));
}

export function LocalVariantSelector({
  options,
  variants,
  onVariantChange
}: {
  options: ProductOption[];
  variants: ProductVariant[];
  // eslint-disable-next-line no-unused-vars -- callback signature
  onVariantChange: (variant: ProductVariant | undefined) => void;
}) {
  const hasNoOptionsOrJustOneOption =
    !options.length || (options.length === 1 && options[0]?.values.length === 1);

  const combinations: Combination[] = useMemo(
    () =>
      variants.map((variant) => ({
        id: variant.id,
        availableForSale: variant.availableForSale,
        ...variant.selectedOptions.reduce(
          (accumulator, option) => ({ ...accumulator, [option.name.toLowerCase()]: option.value }),
          {}
        )
      })),
    [variants]
  );

  const [selected, setSelected] = useState<Record<string, string>>(() => buildInitialSelected(variants));

  useEffect(() => {
    setSelected(buildInitialSelected(variants));
  }, [variants]);

  const resolveVariant = useCallback(
    (sel: Record<string, string>) =>
      variants.find((v) =>
        v.selectedOptions.every((so) => sel[so.name.toLowerCase()] === so.value)
      ),
    [variants]
  );

  const onVariantChangeRef = useRef(onVariantChange);
  onVariantChangeRef.current = onVariantChange;

  useEffect(() => {
    onVariantChangeRef.current(resolveVariant(selected));
  }, [selected, resolveVariant]);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

  return (
    <div className="space-y-5">
      {options.map((option) => (
        <dl key={option.id}>
          <dt className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            {option.name}
          </dt>
          <dd className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const optionNameLowerCase = option.name.toLowerCase();
              const nextSelected = { ...selected, [optionNameLowerCase]: value };
              const filtered = Object.entries(nextSelected).filter(([key, val]) =>
                options.find((o) => o.name.toLowerCase() === key && o.values.includes(val))
              );
              const isAvailableForSale = combinations.find((combination) =>
                filtered.every(
                  ([key, val]) => combination[key] === val && combination.availableForSale
                )
              );
              const isActive = selected[optionNameLowerCase] === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-disabled={!isAvailableForSale}
                  disabled={!isAvailableForSale}
                  onClick={() => setSelected(nextSelected)}
                  title={`${option.name} ${value}${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
                  className={clsx(
                    'min-w-[44px] rounded-md border px-3 py-2 text-[13px] transition',
                    {
                      'border-black bg-neutral-100 font-medium text-black': isActive,
                      'border-neutral-200 bg-white hover:border-neutral-400':
                        !isActive && isAvailableForSale,
                      'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 line-through':
                        !isAvailableForSale
                    }
                  )}
                >
                  {value}
                </button>
              );
            })}
          </dd>
        </dl>
      ))}
    </div>
  );
}
