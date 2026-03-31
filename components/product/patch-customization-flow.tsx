'use client';

import clsx from 'clsx';
import Price from 'components/price';
import { ProductOptionSelectors } from 'components/product/product-option-selectors';
import { ProductCustomizationUpload } from 'components/product/product-customization-upload';
import type { LineItemCustomization, VercelProduct, VercelProductVariant } from 'lib/bigcommerce/types';
import { useCallback, useMemo, useState } from 'react';

const STEPS = ['Quantity', 'Configuration', 'Artwork'] as const;

type StepIndex = 0 | 1 | 2;

function stepStatus(
  index: StepIndex,
  active: StepIndex,
  completed: [boolean, boolean, boolean]
): 'upcoming' | 'active' | 'complete' | 'pastIncomplete' {
  if (completed[index]) return 'complete';
  if (index === active) return 'active';
  if (index < active) return 'pastIncomplete';
  return 'upcoming';
}

export function PatchCustomizationFlow({
  product,
  quantity,
  minQty,
  maxQty,
  onQuantityChange,
  displayPrice,
  customization,
  onCustomizationChange,
  onUploadingChange,
  onVariantChange,
  configurationDone,
  message
}: {
  product: VercelProduct;
  quantity: number;
  minQty: number;
  maxQty: number;
  onQuantityChange: (n: number) => void;
  displayPrice: { amount: string; currencyCode: string } | null;
  message: string | null;
  customization: LineItemCustomization;
  onCustomizationChange: (patch: Partial<LineItemCustomization>) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onVariantChange: (variant: VercelProductVariant | undefined) => void;
  /** True when a valid variant is selected (always true when there are no product options). */
  configurationDone: boolean;
}) {
  const [activeStep, setActiveStep] = useState<StepIndex>(0);

  const hasOptions = product.options.length > 0;

  const artworkComplete = useMemo(() => {
    if (customization.noPersonalizationRequested) return true;
    return Boolean(
      customization.artworkStorageKey ||
        customization.artworkStoragePath ||
        customization.artworkUrl
    );
  }, [customization]);

  const quantityComplete = quantity >= minQty;

  const completed = useMemo(
    (): [boolean, boolean, boolean] => [
      quantityComplete,
      configurationDone,
      artworkComplete
    ],
    [quantityComplete, configurationDone, artworkComplete]
  );

  const goNext = useCallback(() => {
    setActiveStep((s) => (s < 2 ? ((s + 1) as StepIndex) : s));
  }, []);

  const goBack = useCallback(() => {
    setActiveStep((s) => (s > 0 ? ((s - 1) as StepIndex) : s));
  }, []);

  const lineSubtotal = useMemo(() => {
    if (!displayPrice) return null;
    const each = parseFloat(displayPrice.amount);
    if (Number.isNaN(each)) return null;
    return (each * quantity).toFixed(2);
  }, [displayPrice, quantity]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-neutral-200/80 bg-neutral-900 px-4 py-3 md:px-5">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
          Customize your product
        </p>
      </div>

      <div className="shrink-0 border-b border-neutral-200/70 bg-white px-2 py-3 md:px-4 md:py-3.5">
        <nav aria-label="Customization steps" className="flex flex-wrap items-stretch justify-center gap-y-2">
          {STEPS.map((label, i) => {
            const idx = i as StepIndex;
            const status = stepStatus(idx, activeStep, completed);
            const isLast = i === STEPS.length - 1;
            return (
              <div key={label} className="flex min-w-0 flex-1 basis-[100px] items-center sm:basis-auto sm:flex-initial">
                <button
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={clsx(
                    'group flex w-full flex-col items-center gap-1.5 px-1.5 py-1 text-center transition sm:px-3',
                    status === 'active' && 'text-black',
                    (status === 'complete' || status === 'pastIncomplete') && 'text-neutral-700',
                    status === 'upcoming' && 'text-neutral-400'
                  )}
                >
                  <span
                    className={clsx(
                      'text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] sm:text-[11px]',
                      status === 'active' && 'text-black',
                      (status === 'complete' || status === 'pastIncomplete') && 'text-neutral-800',
                      status === 'upcoming' && 'text-neutral-400'
                    )}
                  >
                    {label}
                  </span>
                  <span className="flex h-5 items-center justify-center gap-1" aria-hidden>
                    {status === 'complete' ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        ✓
                      </span>
                    ) : status === 'pastIncomplete' ? (
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-50 text-[10px] font-bold text-amber-800"
                        title="Incomplete"
                      >
                        !
                      </span>
                    ) : (
                      <span
                        className={clsx(
                          'h-2 w-2 rounded-full border-2 transition',
                          status === 'active' && 'border-black bg-black',
                          status === 'upcoming' && 'border-neutral-300 bg-white'
                        )}
                      />
                    )}
                  </span>
                </button>
                {!isLast ? (
                  <div
                    className="hidden h-8 w-px shrink-0 self-center bg-neutral-200 sm:block"
                    aria-hidden
                  />
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
        {activeStep === 0 && (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Quantity</p>
              <p className="mt-1 text-[12px] text-neutral-600">Set your line quantity. Pricing may reflect quantity tiers.</p>
            </div>
            <div className="flex max-w-xs flex-wrap items-center gap-3">
              <label
                htmlFor={`patch-qty-${product.id}`}
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500"
              >
                Units
              </label>
              <div className="flex items-center rounded-full border border-neutral-200 bg-white">
                <button
                  type="button"
                  className="px-3 py-2 text-[15px] text-neutral-600 hover:text-black"
                  aria-label="Decrease quantity"
                  onClick={() => onQuantityChange(Math.max(minQty, quantity - 1))}
                >
                  −
                </button>
                <input
                  id={`patch-qty-${product.id}`}
                  type="number"
                  min={minQty}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isNaN(n)) return;
                    onQuantityChange(Math.max(minQty, Math.min(maxQty, n)));
                  }}
                  className="w-14 border-0 bg-transparent text-center text-[13px] focus:ring-0"
                />
                <button
                  type="button"
                  className="px-3 py-2 text-[15px] text-neutral-600 hover:text-black"
                  aria-label="Increase quantity"
                  onClick={() => onQuantityChange(Math.min(maxQty, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>
            {product.catalog?.minQuantity != null ? (
              <p className="text-[12px] text-neutral-500">Minimum order quantity: {minQty}</p>
            ) : null}
          </div>
        )}

        {activeStep === 1 && (
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Configuration</p>
              <p className="mt-1 text-[12px] text-neutral-600">Choose product options. All combinations update pricing when applicable.</p>
            </div>
            {hasOptions ? (
              <ProductOptionSelectors
                layout="horizontal"
                options={product.options}
                variants={product.variants}
                onVariantChange={onVariantChange}
              />
            ) : (
              <p className="text-[13px] text-neutral-600">No additional options for this product.</p>
            )}
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">Artwork</p>
            <p className="mb-3 text-[12px] text-neutral-600">Upload placement artwork or opt out of personalization.</p>
            <ProductCustomizationUpload
              key={`${product.id}-patch-step`}
              embedded
              product={product}
              customization={customization}
              onCustomizationChange={onCustomizationChange}
              onUploadingChange={onUploadingChange}
            />
          </div>
        )}

        {message ? (
          <p className="mt-4 text-[13px] text-red-600" role="alert">
            {message}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-neutral-200/80 bg-[#f0efec] px-4 py-3 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] text-neutral-700">
            {lineSubtotal && displayPrice ? (
              <p>
                <span className="text-neutral-500">Subtotal: </span>
                <span className="font-semibold tabular-nums text-black">
                  <Price amount={lineSubtotal} currencyCode={displayPrice.currencyCode} />
                </span>
                <span className="ml-1 text-neutral-500">({quantity} × </span>
                <span className="tabular-nums text-neutral-600">
                  <Price amount={displayPrice.amount} currencyCode={displayPrice.currencyCode} />
                </span>
                <span className="text-neutral-500">)</span>
              </p>
            ) : (
              <p className="text-neutral-500">Set quantity to see pricing.</p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={activeStep === 0}
              className={clsx(
                'rounded-md border border-neutral-300 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-800 transition',
                activeStep === 0 ? 'cursor-not-allowed opacity-40' : 'hover:border-neutral-400 hover:bg-neutral-50'
              )}
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={activeStep === 2}
              className={clsx(
                'rounded-md bg-lime-400 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-900 transition',
                activeStep === 2 ? 'cursor-not-allowed opacity-40' : 'hover:bg-lime-300'
              )}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
