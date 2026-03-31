'use client';

import { AddToCartFormInner } from 'components/cart/add-to-cart-form-inner';
import { addItem } from 'components/cart/actions';
import { usePrefersReducedMotion } from 'hooks/use-prefers-reduced-motion';
import { PDP_IMAGE_ORIGIN_ID, runAddToCartFeedback } from 'lib/add-to-cart-animation';
import { VercelProductVariant as ProductVariant } from 'lib/bigcommerce/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useCallback, useState } from 'react';

export function AddToCart({
  variants,
  availableForSale,
  imageUrl = ''
}: {
  variants: ProductVariant[];
  availableForSale: boolean;
  /** Featured image URL for fly animation */
  imageUrl?: string;
}) {
  const [message, formAction] = useActionState(addItem, null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();
  const [success, setSuccess] = useState(false);

  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const defaultProductId = variants.length === 1 ? variants[0]?.parentId : undefined;
  const variant = variants.find((v: ProductVariant) =>
    v.selectedOptions.every((option) => option.value === searchParams.get(option.name.toLowerCase()))
  );
  const selectedVariantId = variant?.id || defaultVariantId;
  const selectedProductId = variant?.parentId || defaultProductId;
  const actionWithVariant = formAction.bind(null, { selectedProductId, selectedVariantId });

  const onSuccess = useCallback(async () => {
    try {
      await router.refresh();
      runAddToCartFeedback({
        imageUrl,
        originId: PDP_IMAGE_ORIGIN_ID,
        reducedMotion,
        playSound: !reducedMotion
      });
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 1200);
    } catch (e) {
      console.error(e);
    }
  }, [router, imageUrl, reducedMotion]);

  return (
    <form action={actionWithVariant}>
      <AddToCartFormInner
        message={message}
        onSuccess={onSuccess}
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
        success={success}
      />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
